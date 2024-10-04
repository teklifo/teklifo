import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { Prisma, ExchangeJob as ExchangeJobType } from "@prisma/client";
import { upsertBalance, upsertPrices, upsertProduct } from "./bulk-import";
import { getErrorMessage } from "../utils";
import { Log } from "@/types";

type XLSXRowDataType = {
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

XLSX.set_fs(fs);

export const readXLSProducts = async (
  exchangeJob: ExchangeJobType,
  logs: Log[]
) => {
  const { companyId, path: fullPath } = exchangeJob;

  const workbook = XLSX.readFile(fullPath);
  if (workbook.SheetNames.length === 0) return;
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const products = XLSX.utils.sheet_to_json<XLSXRowDataType>(sheet);

  return await Promise.all(
    products.map(async (rowData, index) => {
      const numberOfReservedRows = 2;
      const rowNumber = index + numberOfReservedRows;

      try {
        const productData = {
          ...convertRowToProductData(rowData),
          companyId,
        };
        if (!checkProductData(productData, rowNumber, logs)) {
          return;
        }
        await upsertProduct({ ...productData, companyId });
        logs.push({
          id: `Row #${rowNumber}`,
          status: "success",
        });
      } catch (error) {
        logs.push({
          id: `Row #${rowNumber}`,
          status: "error",
          message: getErrorMessage(error),
        });
      }
    })
  );
};

function convertRowToProductData(rowData: XLSXRowDataType) {
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
  logs: Log[]
) {
  let checkResult = true;

  if (!productData.name) {
    logs.push({
      id: `Row #${rowNumber}`,
      status: "error",
      message: "Name is required",
    });
    checkResult = false;
  }

  if (!productData.number) {
    logs.push({
      id: `Row #${rowNumber}`,
      status: "error",
      message: "Number is required",
    });
    checkResult = false;
  }

  if (!productData.unit) {
    logs.push({
      id: `Row #${rowNumber}`,
      status: "error",
      message: "Unit is required",
    });
    checkResult = false;
  }

  return checkResult;
}

function cellValue(value?: string) {
  return value ? value.toString() : "";
}
