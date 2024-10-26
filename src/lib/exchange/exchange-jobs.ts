import fs from "fs";
import path from "path";
import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
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
import { Log } from "@/types";

const connection = new IORedis({ maxRetriesPerRequest: null });

export const getExcangeJobStatus = async (
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

const getBaseId = (filename: string) => {
  const regex = /\${(.*?)}/;
  const match = filename.match(regex);
  return match ? match[1] : "baseId";
};

const getExchangeJobByPath = async (companyId: string, filePath: string) => {
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

export const addReadFileJobToQueue = async (
  companyId: string,
  filePath: string
) => {
  const exchangeJob = await getExchangeJobByPath(companyId, filePath);
  if (!exchangeJob) return;

  const data = { status: ExchangeStatus.PENDING };
  await updateExchangeJobStatus(exchangeJob.id, data);

  const queueName = `${companyId}-exchange`;
  await upsertReadExchangeQueue(queueName, exchangeJob.id);

  createJobWorker(queueName);
};

export const createExchangeJob = async (
  companyId: string,
  filename: string,
  filePath: string,
  type: ExchangeType
) => {
  return await db.exchangeJob.create({
    data: {
      companyId,
      name: filename,
      path: filePath,
      status: "INACTIVE",
      type,
      logs: [],
    },
  });
};

const upsertReadExchangeQueue = async (
  queueName: string,
  exchangeJobId: string
) => {
  const queue = new Queue(queueName);
  await queue.add(
    "read-echange-file",
    { id: exchangeJobId },
    { removeOnComplete: true, removeOnFail: true }
  );
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

const createJobWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { id } = job.data;
      await startExchangeJob(id);
    },
    { connection }
  );
};

export const startExchangeJob = async (id: string) => {
  try {
    const exchangeJob = await findExchangeJob(id);
    if (!exchangeJob) return;

    const file = await fileExists(exchangeJob.path);
    if (!file) {
      return;
    }

    const logs: Log[] = [];

    await readExchangeFile(exchangeJob, logs);

    const data = {
      status: getExchangeJobStatusFromLogs(logs),
      logs,
    };
    await updateExchangeJobStatus(exchangeJob.id, data);

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

const findExchangeJob = async (id: string) => {
  return await db.exchangeJob.findUnique({
    where: {
      id,
    },
  });
};

const readExchangeFile = async (exchangeJob: ExchangeJob, logs: Log[]) => {
  if (exchangeJob.type === "CML_IMPORT") await readCMLImport(exchangeJob, logs);
  if (exchangeJob.type === "CML_OFFERS") await readCMLOffers(exchangeJob, logs);
  if (exchangeJob.type === "XLSX_PRODUCTS")
    await readXLSProducts(exchangeJob, logs);
  if (exchangeJob.type === "XLSX_PRICES")
    await readXLSPrices(exchangeJob, logs);
  if (exchangeJob.type === "XLSX_BALANCE")
    await readXLSBalance(exchangeJob, logs);
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

const getExchangeJobStatusFromLogs = (logs: Log[]): ExchangeStatus => {
  const error = logs.find((log) => log.status === "error");
  return error ? "ERROR" : "SUCCESS";
};

const deleteExchangeFile = async (filePath: string) => {
  await fs.promises.rm(filePath, {
    recursive: true,
    force: true,
  });
};
