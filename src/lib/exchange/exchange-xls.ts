import fs from "fs";
import * as XLSX from "xlsx";
import { getTranslations } from "next-intl/server";
import { Prisma, ExchangeJob as ExchangeJobType } from "@prisma/client";
import { upsertBalance, upsertPrices, upsertProduct } from "./bulk-import";
import { exchangeLog } from "./exchangeLog";
import { getErrorMessage } from "../utils";
import db from "../db";

type XLSXProductRowDataType = {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
  5?: string;
  6?: string;
  7?: string;
  8?: string;
  9?: string;
};

type XLSXPriceRowDataType = {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
};

type XLSXBalanceRowDataType = {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
};

XLSX.set_fs(fs);

export const readXLSProducts = async (exchangeJob: ExchangeJobType) => {
  const { id: exchangeJobId, companyId, path: fullPath, locale } = exchangeJob;

  const t = await getTranslations({ locale, namespace: "XLSXExchangeLogs" });

  const workbook = XLSX.readFile(fullPath);
  if (workbook.SheetNames.length === 0) return;
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const products = XLSX.utils.sheet_to_json<XLSXProductRowDataType>(sheet);

  return await Promise.all(
    products.map(async (rowData, index) => {
      const startRowNumber = 2;
      const rowNumber = index + startRowNumber;

      try {
        const productData = {
          ...convertRowToProductData(rowData),
          companyId,
        };

        const checkResult = await checkProductData(
          productData,
          rowNumber,
          exchangeJob
        );

        if (!checkResult) {
          return;
        }
        const product = await upsertProduct({ ...productData, companyId });
        exchangeLog({
          exchangeJobId,
          status: "SUCCESS",
          message: t("product", {
            rowNumber,
            id: product.id,
            name: product.name,
            number: product.number,
          }),
        });
      } catch (error) {
        exchangeLog({
          exchangeJobId,
          status: "ERROR",
          message: t("productError", {
            rowNumber,
            error: getErrorMessage(error),
          }),
        });
      }
    })
  );
};

function convertRowToProductData(rowData: XLSXProductRowDataType) {
  const name = cellValue(rowData["1"]);
  const number = cellValue(rowData["2"]);
  const unit = cellValue(rowData["3"]);
  const productId = cellValue(rowData["4"]);
  const characteristicId = cellValue(rowData["5"]);
  const brand = cellValue(rowData["6"]);
  const brandNumber = cellValue(rowData["7"]);
  const description = cellValue(rowData["8"]);
  const archive = cellValue(rowData["9"]).toLocaleLowerCase() === "1";
  const externalId = cellValue(
    characteristicId ? `${productId}#${characteristicId}` : productId
  );

  return {
    name,
    number,
    unit,
    externalId,
    productId,
    characteristicId,
    brand,
    brandNumber,
    description,
    archive,
  };
}

async function checkProductData(
  productData: Prisma.ProductUncheckedCreateInput,
  rowNumber: number,
  exchangeJob: ExchangeJobType
) {
  const { id: exchangeJobId, locale } = exchangeJob;

  const t = await getTranslations({ locale, namespace: "XLSXExchangeLogs" });

  let checkResult = true;

  if (!productData.name) {
    exchangeLog({
      exchangeJobId,
      status: "ERROR",
      message: t("nameIsRequired", {
        rowNumber,
      }),
    });
    checkResult = false;
  }

  if (!productData.number) {
    exchangeLog({
      exchangeJobId,
      status: "ERROR",
      message: t("numberIsRequired", {
        rowNumber,
      }),
    });
    checkResult = false;
  }

  if (!productData.unit) {
    exchangeLog({
      exchangeJobId,
      status: "ERROR",
      message: t("unitIsRequired", {
        rowNumber,
      }),
    });
    checkResult = false;
  }

  return checkResult;
}

export const readXLSPrices = async (exchangeJob: ExchangeJobType) => {
  const { id: exchangeJobId, companyId, path: fullPath, locale } = exchangeJob;

  const t = await getTranslations({ locale, namespace: "XLSXExchangeLogs" });

  const workbook = XLSX.readFile(fullPath);
  if (workbook.SheetNames.length === 0) return;
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const prices = XLSX.utils.sheet_to_json<XLSXPriceRowDataType>(sheet);

  return await Promise.all(
    prices.map(async (rowData, index) => {
      const startRowNumber = 2;
      const rowNumber = index + startRowNumber;

      try {
        const priceData = convertRowToPriceData(rowData);

        const product = await db.product.findFirst({
          where: {
            AND: [
              {
                OR: [
                  {
                    id: priceData.productId,
                  },
                  {
                    number: priceData.productNumber,
                  },
                ],
              },
              {
                companyId,
              },
            ],
          },
          select: {
            id: true,
          },
        });

        if (!product) {
          exchangeLog({
            exchangeJobId,
            status: "ERROR",
            message: t("productNotFound", {
              rowNumber,
              id: priceData.productId,
              number: priceData.productNumber,
            }),
          });
          return;
        }

        const priceType = await db.priceType.findUnique({
          where: {
            id: priceData.priceTypeId,
          },
          select: {
            id: true,
          },
        });

        if (!priceType) {
          exchangeLog({
            exchangeJobId,
            status: "ERROR",
            message: t("priceTypeNotFound", {
              rowNumber,
              id: priceData.priceTypeId,
            }),
          });
          return;
        }

        await upsertPrices({
          productId: product.id,
          priceTypeId: priceType.id,
          price: priceData.price,
        });

        exchangeLog({
          exchangeJobId,
          status: "SUCCESS",
          message: t("price", {
            rowNumber,
          }),
        });
      } catch (error) {
        exchangeLog({
          exchangeJobId,
          status: "ERROR",
          message: t("priceError", {
            rowNumber,
            error: getErrorMessage(error),
          }),
        });
      }
    })
  );
};

function convertRowToPriceData(rowData: XLSXPriceRowDataType) {
  const productId = parseInt(cellValue(rowData["1"])) || 0;
  const productNumber = cellValue(rowData["2"]);
  const priceTypeId = cellValue(rowData["3"]);
  const price = parseInt(cellValue(rowData["4"])) || 0;

  return {
    productId,
    productNumber,
    priceTypeId,
    price,
  };
}

export const readXLSBalance = async (exchangeJob: ExchangeJobType) => {
  const { id: exchangeJobId, companyId, path: fullPath, locale } = exchangeJob;

  const t = await getTranslations({ locale, namespace: "XLSXExchangeLogs" });

  const workbook = XLSX.readFile(fullPath);
  if (workbook.SheetNames.length === 0) return;
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const balance = XLSX.utils.sheet_to_json<XLSXBalanceRowDataType>(sheet);

  return await Promise.all(
    balance.map(async (rowData, index) => {
      const startRowNumber = 2;
      const rowNumber = index + startRowNumber;

      try {
        const balanceData = convertRowToBalanceData(rowData);
        const product = await db.product.findFirst({
          where: {
            AND: [
              {
                OR: [
                  {
                    id: balanceData.productId,
                  },
                  {
                    number: balanceData.productNumber,
                  },
                ],
              },
              {
                companyId,
              },
            ],
          },
          select: {
            id: true,
          },
        });

        if (!product) {
          exchangeLog({
            exchangeJobId,
            status: "ERROR",
            message: t("productNotFound", {
              rowNumber,
              id: balanceData.productId,
              number: balanceData.productNumber,
            }),
          });
          return;
        }

        const stock = await db.stock.findUnique({
          where: {
            id: balanceData.stockId,
          },
          select: {
            id: true,
          },
        });

        if (!stock) {
          exchangeLog({
            exchangeJobId,
            status: "ERROR",
            message: t("stockNotFound", {
              rowNumber,
              id: balanceData.stockId,
            }),
          });
          return;
        }

        await upsertBalance({
          productId: product.id,
          stockId: stock.id,
          quantity: balanceData.quantity,
        });

        exchangeLog({
          exchangeJobId,
          status: "SUCCESS",
          message: t("balance", {
            rowNumber,
          }),
        });
      } catch (error) {
        exchangeLog({
          exchangeJobId,
          status: "ERROR",
          message: t("balanceError", {
            rowNumber,
            error: getErrorMessage(error),
          }),
        });
      }
    })
  );
};

function convertRowToBalanceData(rowData: XLSXBalanceRowDataType) {
  const productId = parseInt(cellValue(rowData["1"])) || 0;
  const productNumber = cellValue(rowData["2"]);
  const stockId = cellValue(rowData["3"]);
  const quantity = parseInt(cellValue(rowData["4"])) || 0;

  return {
    productId,
    productNumber,
    stockId,
    quantity,
  };
}

function cellValue(value?: string) {
  return value ? value.toString() : "";
}
