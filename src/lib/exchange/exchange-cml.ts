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
import { upsertBalance, upsertPrices, upsertProduct } from "./bulk-import";
import { getErrorMessage } from "../utils";
import {
  CML_Import,
  CML_Offers,
  CML_ДанныеЦены,
  CML_СвойстваОстатка,
  CML_Склад,
  CML_ТипЦены,
  Log,
} from "@/types";

type ProductTypeWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export const readCMLImport = async (
  exchangeJob: ExchangeJobType,
  logs: Log[]
) => {
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

  await Promise.all(
    catalogs.map(async (catalog) => {
      const products =
        catalog.Товары.length > 0 ? catalog.Товары[0].Товар : null;
      if (!products) return;

      return await Promise.all(
        products.map(async (productData) => {
          try {
            // Read productId and characteristicId if provided
            const externalId = getXmlValue(productData.Ид);
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
            logs.push({
              id: `${data.externalId} - ${data.number} - ${data.name}`,
              status: "success",
            });

            // Upsert product images
            const folderPath = path.dirname(fullPath);

            await upsertCMLImages(product, images, folderPath, onlyChanges);
          } catch (error) {
            logs.push({
              id: `Product: ${getXmlValue(productData.Ид)}`,
              status: "error",
              message: getErrorMessage(error),
            });
          }
        })
      );
    })
  );
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
    images.length === 0 ||
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
        try {
          const path = `${folderPath}/${image}`;
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

export const readCMLOffers = async (
  exchangeJob: ExchangeJobType,
  logs: Log[]
) => {
  const { companyId, path: fullPath } = exchangeJob;

  // Retrieve data from plain xml
  const importXml = await fs.promises.readFile(fullPath, "utf8");
  const parser = new xml2js.Parser();
  const offersData = (await parser.parseStringPromise(importXml)) as CML_Offers;

  const offersPackage = offersData.КоммерческаяИнформация.ПакетПредложений;

  await Promise.all(
    offersPackage.map(async (offerPackage) => {
      // Stocks & price types must be uploaded before prices and balances
      const stocks = await upsertCMLStocks(
        companyId,
        offerPackage.Склады,
        logs
      );
      const priceTypes = await upsertCMLPriceTypes(
        companyId,
        offerPackage.ТипыЦен,
        logs
      );

      // Read offers
      offerPackage.Предложения.map((offers) => {
        const offerData = offers.Предложение;

        offerData.map(async (offer) => {
          const productId = getXmlValue(offer.Ид);
          const number = getXmlValue(offer.Артикул);

          if (!productId || !number) return;

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
            await upsertCMLBalance(offer.Склад, stocks, product.id, logs);
            await upsertCMLPrices(offer.Цены, priceTypes, product.id, logs);
          }
        });
      });
    })
  );
};

const upsertCMLStocks = async (
  companyId: string,
  stocksdata: { Склад: CML_Склад[] }[],
  logs: Log[]
) => {
  const uploadedStocks: StockType[] = [];

  await Promise.all(
    stocksdata.map(async (stockData) => {
      await Promise.all(
        stockData.Склад.map(async (stock) => {
          const stockExternalId = getXmlValue(stock.Ид);
          const stockName = getXmlValue(stock.Наименование);
          try {
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
            const result = await db.stock.upsert({
              where: {
                id: existingStock?.id ?? "",
              },
              create: data,
              update: data,
            });

            uploadedStocks.push(result);

            logs.push({
              id: `Stock: ${stockExternalId} - ${stockName}`,
              status: "success",
            });
          } catch (error) {
            logs.push({
              id: `Stock: ${stockExternalId} - ${stockName}`,
              status: "error",
              message: getErrorMessage(error),
            });
          }
        })
      );
    })
  );

  return uploadedStocks;
};

const upsertCMLPriceTypes = async (
  companyId: string,
  priceTypesData: { ТипЦены: CML_ТипЦены[] }[],
  logs: Log[]
) => {
  const uploadedPriceTypes: PriceTypeType[] = [];

  await Promise.all(
    priceTypesData.map(async (priceTypeData) => {
      await Promise.all(
        priceTypeData.ТипЦены.map(async (priceType) => {
          const priceTypeExternalId = getXmlValue(priceType.Ид);
          const priceTypeName = getXmlValue(priceType.Наименование);
          try {
            const currency = getXmlValue(priceType.Валюта);

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

            const result = await db.priceType.upsert({
              where: {
                id: existingStock?.id ?? "",
              },
              create: data,
              update: data,
            });

            uploadedPriceTypes.push(result);

            logs.push({
              id: `Price type: ${priceTypeExternalId} - ${priceTypeName}`,
              status: "success",
            });
          } catch (error) {
            logs.push({
              id: `Price type: ${priceTypeExternalId} - ${priceTypeName}`,
              status: "error",
              message: getErrorMessage(error),
            });
          }
        })
      );
    })
  );

  return uploadedPriceTypes;
};

const upsertCMLBalance = async (
  balance: CML_СвойстваОстатка[],
  stocks: StockType[],
  productId: number,
  logs: Log[]
) => {
  return await Promise.all(
    balance.map(async (stockData) => {
      try {
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

        const balance = await upsertBalance(data);
        logs.push({
          id: `Balance: ${data.stockId} - ${data.productId}`,
          status: "success",
        });
        return balance;
      } catch (error) {
        logs.push({
          id: `Balance: ${productId}`,
          status: "error",
          message: getErrorMessage(error),
        });
      }
    })
  );
};

const upsertCMLPrices = async (
  priceData: CML_ДанныеЦены[],
  priceTypes: PriceTypeType[],
  productId: number,
  logs: Log[]
) => {
  const uploadedPrices: PriceType[] = [];

  await Promise.all(
    priceData.map(async (prices) => {
      await Promise.all(
        prices.Цена.map(async (priceData) => {
          const priceTypeExternalId = getXmlValue(priceData.ИдТипаЦены);
          try {
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

            const result = await upsertPrices(data);
            logs.push({
              id: `Price: ${priceTypeExternalId} - ${productId}`,
              status: "success",
            });
            uploadedPrices.push(result);
          } catch (error) {
            logs.push({
              id: `Price: ${priceTypeExternalId} - ${productId}`,
              status: "error",
              message: getErrorMessage(error),
            });
          }
        })
      );
    })
  );

  return uploadedPrices;
};

const getXmlValue = (array?: string[]) => {
  return array && array.length > 0 ? array[0] : "";
};
