import fs from "fs";
import * as XLSX from "xlsx";
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
  const { companyId, path: fullPath, id: exchangeJobId } = exchangeJob;

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
        if (!checkProductData(productData, rowNumber, exchangeJobId)) {
          return;
        }
        await upsertProduct({ ...productData, companyId });
        exchangeLog({
          exchangeJobId,
          status: "SUCCESS",
          message: `Row #${rowNumber}`,
        });
      } catch (error) {
        exchangeLog({
          exchangeJobId,
          status: "ERROR",
          message: `Row #${rowNumber} - ${getErrorMessage(error)}`,
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

function checkProductData(
  productData: Prisma.ProductUncheckedCreateInput,
  rowNumber: number,
  exchangeJobId: string
) {
  let checkResult = true;

  if (!productData.name) {
    exchangeLog({
      exchangeJobId,
      status: "ERROR",
      message: `Row #${rowNumber} - Name is required`,
    });
    checkResult = false;
  }

  if (!productData.number) {
    exchangeLog({
      exchangeJobId,
      status: "ERROR",
      message: `Row #${rowNumber} - SKU is required`,
    });
    checkResult = false;
  }

  if (!productData.unit) {
    exchangeLog({
      exchangeJobId,
      status: "ERROR",
      message: `Row #${rowNumber} - Unit is required`,
    });
    checkResult = false;
  }

  return checkResult;
}

export const readXLSPrices = async (exchangeJob: ExchangeJobType) => {
  const { companyId, path: fullPath, id: exchangeJobId } = exchangeJob;

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
            message: `Row #${rowNumber} - Product not found (ID: ${priceData.productId}, number: ${priceData.productNumber})`,
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
            message: `Row #${rowNumber} - Price type not found (${priceData.priceTypeId})`,
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
          message: `Row #${rowNumber}`,
        });
      } catch (error) {
        exchangeLog({
          exchangeJobId,
          status: "ERROR",
          message: `Row #${rowNumber} - ${getErrorMessage(error)}`,
        });
      }
    })
  );
};

function convertRowToPriceData(rowData: XLSXPriceRowDataType) {
  const productId = parseInt(cellValue(rowData["1"]));
  const productNumber = cellValue(rowData["2"]);
  const priceTypeId = cellValue(rowData["3"]);
  const price = parseInt(cellValue(rowData["4"]));

  return {
    productId,
    productNumber,
    priceTypeId,
    price,
  };
}

export const readXLSBalance = async (exchangeJob: ExchangeJobType) => {
  const { companyId, path: fullPath, id: exchangeJobId } = exchangeJob;

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
            message: `Row #${rowNumber} - Product not found (ID: ${balanceData.productId}, number: ${balanceData.productNumber})`,
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
            message: `Row #${rowNumber} - Stock not found (${balanceData.stockId})`,
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
          message: `Row #${rowNumber}`,
        });
      } catch (error) {
        exchangeLog({
          exchangeJobId,
          status: "ERROR",
          message: `Row #${rowNumber} - getErrorMessage(error)`,
        });
      }
    })
  );
};

function convertRowToBalanceData(rowData: XLSXBalanceRowDataType) {
  const productId = parseInt(cellValue(rowData["1"]));
  const productNumber = cellValue(rowData["2"]);
  const stockId = cellValue(rowData["3"]);
  const quantity = parseInt(cellValue(rowData["4"]));

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
