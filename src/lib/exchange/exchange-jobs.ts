import fs from "fs";
import path from "path";
import {
  ExchangeJob,
  ExchangeStatus,
  ExchangeType,
  Prisma,
} from "@prisma/client";
import db from "@/lib/db";
import { fileExists } from "@/lib/utils";
import { readCMLImport, readCMLOffers } from "./exchange-cml";
import { readXLSBalance, readXLSPrices, readXLSProducts } from "./exchange-xls";

export const getExcangeJobByFileName = async (
  companyId: string,
  filename: string
) => {
  const filePath = getExchangeFilePath(filename, companyId);
  return await getExchangeJobByPath(companyId, filePath);
};

export const getExchangeFilePath = (filename: string, companyId: string) => {
  const baseId = getBaseId(filename);
  return `${process.cwd()}/exchange-files/${companyId}/${baseId}/${filename}`;
};

export const getExchangeJobByPath = async (
  companyId: string,
  filePath: string
) => {
  const exchangeJob = await db.exchangeJob.findFirst({
    where: {
      path: filePath,
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return exchangeJob;
};

export const createExchangeJob = async (
  companyId: string,
  filename: string,
  filePath: string,
  type: ExchangeType,
  locale: string
) => {
  return await db.exchangeJob.create({
    data: {
      companyId,
      name: filename,
      path: filePath,
      status: "INACTIVE",
      type,
      locale,
    },
  });
};

export async function makeDirectoryFromFullPath(fullPath: string) {
  const folderPath = path.dirname(fullPath);
  if (!(await fileExists(folderPath))) {
    await fs.promises.mkdir(folderPath, { recursive: true });
  }
}

export const getExchangeFileType = (filePath: string) => {
  if (filePath.includes("import")) return ExchangeType.CML_IMPORT;
  if (filePath.includes("offers")) return ExchangeType.CML_OFFERS;
  if (filePath.includes("products")) return ExchangeType.XLSX_PRODUCTS;
  if (filePath.includes("prices")) return ExchangeType.XLSX_PRICES;
  if (filePath.includes("balance")) return ExchangeType.XLSX_BALANCE;
  return null;
};

export const startExchangeJob = async (id: string) => {
  try {
    const exchangeJob = await findExchangeJob(id);
    if (!exchangeJob) return;

    await updateExchangeJobStatus(exchangeJob.id, {
      status: ExchangeStatus.PENDING,
    });

    const file = await fileExists(exchangeJob.path);
    if (!file) {
      return;
    }

    await readExchangeFile(exchangeJob);

    const status = (await getExchangeJobStatusFromLogs(
      exchangeJob.id
    )) as ExchangeStatus;

    await updateExchangeJobStatus(exchangeJob.id, { status });

    await deleteExchangeFile(exchangeJob.path);

    if (exchangeJob.type === "CML_IMPORT") {
      const folderPath = `${path.dirname(exchangeJob.path)}/import_files`;
      const importFiles = await fileExists(folderPath);
      if (importFiles) {
        await deleteExchangeFile(folderPath);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getBaseId = (filename: string) => {
  const regex = /\${(.*?)}/;
  const match = filename.match(regex);
  return match ? match[1] : "baseId";
};

const findExchangeJob = async (id: string) => {
  return await db.exchangeJob.findUnique({
    where: {
      id,
    },
  });
};

const readExchangeFile = async (exchangeJob: ExchangeJob) => {
  if (exchangeJob.type === "CML_IMPORT") await readCMLImport(exchangeJob);
  if (exchangeJob.type === "CML_OFFERS") await readCMLOffers(exchangeJob);
  if (exchangeJob.type === "XLSX_PRODUCTS") await readXLSProducts(exchangeJob);
  if (exchangeJob.type === "XLSX_PRICES") await readXLSPrices(exchangeJob);
  if (exchangeJob.type === "XLSX_BALANCE") await readXLSBalance(exchangeJob);
};

const updateExchangeJobStatus = async (
  id: string,
  data: Prisma.ExchangeJobUpdateInput
) => {
  await db.exchangeJob.update({
    where: {
      id,
    },
    data,
  });
};

const getExchangeJobStatusFromLogs = async (exchangeJobId: string) => {
  const result = await db.exchangeLog.findFirst({
    where: {
      exchangeJobId,
      status: "ERROR",
    },
  });
  return result ? "ERROR" : "SUCCESS";
};

const deleteExchangeFile = async (filePath: string) => {
  await fs.promises.rm(filePath, {
    recursive: true,
    force: true,
  });
};
