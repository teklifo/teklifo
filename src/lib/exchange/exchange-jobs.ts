import fs from "fs";
import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { ExchangeType } from "@prisma/client";
import db from "@/lib/db";
import { fileExists } from "@/lib/utils";
import { readCMLImport, readCMLOffers } from "./exchange-cml";

const connection = new IORedis({ maxRetriesPerRequest: null });

export const getExcangeJobStatus = async (
  companyId: string,
  filename: string
) => {
  const filePath = getExchangeFilePath(filename, companyId);
  return await getExchangeJobStatusByPath(companyId, filePath);
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

const getExchangeJobStatusByPath = async (
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

  return exchangeJob?.status || "SUCCESS";
};

export const addReadFileJobToQueue = async (
  companyId: string,
  fullPath: string
) => {
  const type = getExchangeFileType(fullPath);
  if (!type) return;

  const exchangeJob = await db.exchangeJob.create({
    data: {
      companyId,
      path: fullPath,
      status: "PENDING",
      type,
      errors: [],
    },
  });

  const queueName = `${companyId}-exchange`;
  const queue = new Queue(queueName);
  await queue.add(
    "read-echange-file",
    { id: exchangeJob.id },
    { removeOnComplete: true, removeOnFail: true }
  );
  createJobWorker(queueName);
};

const getExchangeFileType = (fullPath: string) => {
  if (fullPath.includes("import")) return ExchangeType.CML_IMPORT;
  if (fullPath.includes("offers")) return ExchangeType.CML_OFFERS;
  if (fullPath.includes("products")) return ExchangeType.XLSX_PRODUCTS;
  if (fullPath.includes("prices")) return ExchangeType.XLSX_PRICES;
  if (fullPath.includes("balance")) return ExchangeType.XLSX_BALANCE;
  return null;
};

const createJobWorker = (queueName: string) => {
  new Worker(
    queueName,
    async (job: Job) => {
      const { id } = job.data;

      try {
        const exchangeJob = await db.exchangeJob.findUnique({
          where: {
            id,
          },
        });

        if (!exchangeJob) return;

        const file = await fileExists(exchangeJob.path);
        if (!file) {
          return;
        }

        if (exchangeJob.type === "CML_IMPORT") await readCMLImport(exchangeJob);
        if (exchangeJob.type === "CML_OFFERS") await readCMLOffers(exchangeJob);

        await fs.promises.rm(exchangeJob.path, {
          recursive: true,
          force: true,
        });
      } catch (error) {}
    },
    { connection }
  );
};
