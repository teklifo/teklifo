import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { ExchangeJob as ExchangeJobType } from "@prisma/client";
import { upsertBalance, upsertPrices, upsertProduct } from "./bulk-import";
import { getErrorMessage } from "../utils";
import { Log } from "@/types";

XLSX.set_fs(fs);

export const readXLSProducts = async (
  exchangeJob: ExchangeJobType,
  logs: Log[]
) => {
  const { companyId, path: fullPath } = exchangeJob;

  try {
    const workbook = XLSX.readFile(fullPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    console.log(jsonData);

    // const product = await upsertProduct(data);
    // logs.push({
    //   id: `${data.externalId} - ${data.number} - ${data.name}`,
    //   status: "success",
    // });
  } catch (error) {
    logs.push({
      id: `Product: `,
      status: "error",
      message: getErrorMessage(error),
    });
  }
};
