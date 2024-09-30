import fs from "fs";
import path from "path";
import { ExchangeJob as ExchangeJobType } from "@prisma/client";
import { upsertBalance, upsertPrices, upsertProduct } from "./bulk-import";
import { getErrorMessage } from "../utils";
import { Log } from "@/types";

export const readXLSProducts = async (
  exchangeJob: ExchangeJobType,
  logs: Log[]
) => {
  const { companyId, path: fullPath } = exchangeJob;

  // Retrieve data from plain xml
  const xlsFile = await fs.promises.readFile(fullPath, "utf8");

  try {
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
