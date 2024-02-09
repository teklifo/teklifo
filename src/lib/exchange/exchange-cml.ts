import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import cloudinary from "@/lib/cloudinary";
import {
  Prisma,
  ExchangeJob as ExchangeJobType,
  Stock as StockType,
  PriceType as PriceTypeType,
  Price as PriceType,
} from "@prisma/client";
import db from "../db";
import {
  CML_Import,
  CML_Offers,
  CML_ДанныеЦены,
  CML_СвойстваОстатка,
  CML_Склад,
  CML_ТипЦены,
} from "@/types";
import { upsertBalance, upsertPrices, upsertProduct } from "./bulk-import";

type ProductTypeWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export const readCMLImport = async (exchangeJob: ExchangeJobType) => {
  const { companyId, path: fullPath } = exchangeJob;

  // Retrieve data from plain xml
  const importXml = await fs.promises.readFile(fullPath, "utf8");
  const parser = new xml2js.Parser();
  const importData = (await parser.parseStringPromise(importXml)) as CML_Import;

  // Map through catalogs
  const catalogs = importData.КоммерческаяИнформация.Каталог;
  const onlyChanges =
    catalogs.length > 0
      ? catalogs[0].СодержитТолькоИзменения
        ? catalogs[0].СодержитТолькоИзменения[0] === "true"
        : catalogs[0].$?.СодержитТолькоИзменения === "true"
      : true;

  catalogs.map(async (catalog) => {
    const products = catalog.Товары.length > 0 ? catalog.Товары[0].Товар : null;
    if (!products) return;

    await Promise.all(
      products.map(async (productData) => {
        // Read productId and characteristicId if provided
        const externalId = productData.Ид[0];
        const ids = externalId.split("#");
        const productId = ids[0];
        const characteristicId = ids.length > 1 ? ids[1] : "";

        // Read images path
        const images: string[] = [];
        if (productData.Картинка && productData.Картинка.length > 0) {
          productData.Картинка.map((e) => {
            images.push(e);
          });
        }

        // Extract other properties
        const name = getXmlValue(productData.Наименование);
        const number = getXmlValue(productData.Артикул);
        const description = getXmlValue(productData.Описание);
        const brand =
          productData.Изготовитель && productData.Изготовитель?.length > 0
            ? getXmlValue(productData.Изготовитель[0].Наименование)
            : "";
        const unit =
          productData.БазоваяЕдиница.length > 0
            ? productData.БазоваяЕдиница[0].$.НаименованиеПолное
            : "";

        // Upsert product
        const data = {
          companyId,
          externalId,
          productId,
          characteristicId,
          name,
          number,
          brand,
          brandNumber: "",
          unit,
          description,
          archive: false,
        };

        const product = await upsertProduct(data);

        // Upsert product images
        const folderPath = path.dirname(fullPath);
        await upsertCMLImages(product, images, folderPath, onlyChanges);
      })
    );
  });
};

const upsertCMLImages = async (
  product: ProductTypeWithImages,
  images: string[],
  folderPath: string,
  onlyChanges: boolean
) => {
  // Images will be uploaded in two cases:
  // 1. Product didn't have an commerceMl image before
  // 2. This exchange file contains only changes
  // Also characteristicId must be empty

  const existingCommerceMlImages = product.images.filter(
    (i) => i.commerceMl === true
  );

  if (
    !images ||
    (existingCommerceMlImages.length > 0 && !onlyChanges) ||
    product.characteristicId
  ) {
    return;
  }

  try {
    // Delete old images
    await Promise.all(
      existingCommerceMlImages.map(async (i) => {
        await cloudinary.uploader.destroy(i.id);
      })
    );

    // Upload new images
    const results = await Promise.all(
      images.map(async (image) => {
        const path = `${folderPath}/${image}`;
        try {
          return await cloudinary.uploader.upload(path);
        } catch (error) {
          return {
            public_id: "",
            secure_url: "",
          };
        }
      })
    );

    const data = results
      .filter((e) => e.public_id !== "")
      .map((result) => {
        return {
          id: result.public_id,
          url: result.secure_url,
          commerceMl: true,
          productId: product.id,
        };
      });

    // Update product images
    await db.productImage.createMany({
      data,
    });
  } catch (error) {
    console.log(error);
  }
};

export const readCMLOffers = async (exchangeJob: ExchangeJobType) => {
  const { companyId, path: fullPath } = exchangeJob;

  // Retrieve data from plain xml
  const importXml = await fs.promises.readFile(fullPath, "utf8");
  const parser = new xml2js.Parser();
  const offersData = (await parser.parseStringPromise(importXml)) as CML_Offers;

  const offersPackage = offersData.КоммерческаяИнформация.ПакетПредложений;

  offersPackage.map(async (offerPackage) => {
    // Stocks & price types must be uploaded before prices and balances
    const stocks = await upsertCMLStocks(companyId, offerPackage.Склады);
    const priceTypes = await upsertCMLPriceTypes(
      companyId,
      offerPackage.ТипыЦен
    );

    // Read offers
    offerPackage.Предложения.map((offers) => {
      const offerData = offers.Предложение;

      offerData.map(async (offer) => {
        const productId = offer.Ид[0];
        const number = offer.Артикул[0];

        const product = await db.product.findFirst({
          where: {
            productId,
            number,
            companyId,
          },
          select: {
            id: true,
          },
        });

        if (product) {
          await upsertCMLBalance(offer.Склад, stocks, product.id);
          await upsertCMLPrices(offer.Цены, priceTypes, product.id);
        }
      });
    });
  });
};

const upsertCMLStocks = async (
  companyId: string,
  stocksdata: { Склад: CML_Склад[] }[]
) => {
  const data = await Promise.all(
    stocksdata.map(async (stockData) => {
      return Promise.all(
        stockData.Склад.map(async (stock) => {
          const stockExternalId = stock.Ид[0];
          const stockName = stock.Наименование[0];

          // Find stock by externalId
          const existingStock = await db.stock.findFirst({
            where: {
              AND: [
                {
                  externalId: stockExternalId,
                },
                {
                  companyId,
                },
              ],
            },
          });

          // Upsert stock
          const data = {
            companyId,
            externalId: stockExternalId,
            name: stockName,
          };
          return await db.stock.upsert({
            where: {
              id: existingStock?.id ?? "",
            },
            create: data,
            update: data,
          });
        })
      );
    })
  );

  return unflattenData<StockType>(data);
};

const upsertCMLPriceTypes = async (
  companyId: string,
  priceTypesData: { ТипЦены: CML_ТипЦены[] }[]
) => {
  const data = await Promise.all(
    priceTypesData.map(async (priceTypeData) => {
      return Promise.all(
        priceTypeData.ТипЦены.map(async (priceType) => {
          const priceTypeExternalId = priceType.Ид[0];
          const priceTypeName = priceType.Наименование[0];
          const currency = priceType.Валюта[0];

          // Find priceType by externalId
          const existingStock = await db.priceType.findFirst({
            where: {
              AND: [
                {
                  externalId: priceTypeExternalId,
                },
                {
                  companyId,
                },
              ],
            },
          });

          // Upsert priceType
          const data = {
            companyId,
            externalId: priceTypeExternalId,
            name: priceTypeName,
            currency,
          };

          return await db.priceType.upsert({
            where: {
              id: existingStock?.id ?? "",
            },
            create: data,
            update: data,
          });
        })
      );
    })
  );

  return unflattenData<PriceTypeType>(data);
};

const upsertCMLBalance = async (
  balance: CML_СвойстваОстатка[],
  stocks: StockType[],
  productId: number
) => {
  return await Promise.all(
    balance.map(async (stockData) => {
      const stockExternalId = stockData.$.ИдСклада;
      const quantity = parseFloat(stockData.$.КоличествоНаСкладе);

      const stock = stocks.find((e) => e.externalId === stockExternalId);
      if (!stock) return null;

      const stockId = stock.id;

      const data = {
        stockId,
        productId,
        quantity,
      };

      return await upsertBalance(data);
    })
  );
};

const upsertCMLPrices = async (
  priceData: CML_ДанныеЦены[],
  priceTypes: PriceTypeType[],
  productId: number
) => {
  const data = await Promise.all(
    priceData.map(async (prices) => {
      return await Promise.all(
        prices.Цена.map(async (priceData) => {
          const priceTypeExternalId = getXmlValue(priceData.ИдТипаЦены);
          const price = parseFloat(getXmlValue(priceData.ЦенаЗаЕдиницу));

          const priceType = priceTypes.find(
            (e) => e.externalId === priceTypeExternalId
          );
          if (!priceType) return null;

          const priceTypeId = priceType.id;

          const data = {
            priceTypeId,
            productId,
            price,
          };

          return await upsertPrices(data);
        })
      );
    })
  );

  return unflattenData<PriceType | null>(data);
};

const getXmlValue = (array?: string[]) => {
  return array && array.length > 0 ? array[0] : "";
};

const unflattenData = <T>(data: T[][]) => {
  const flattenData: T[] = [];
  data.forEach((u) =>
    u.forEach((d) => {
      flattenData.push(d);
    })
  );
  return flattenData;
};
