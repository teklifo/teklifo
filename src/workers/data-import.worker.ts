import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { startExchangeJob } from "@/lib/exchange/exchange-jobs";

const connection = new IORedis({ maxRetriesPerRequest: null });

const queueName = "data-import";

type QueueDataType = {
  id: string;
};

const queue = new Queue(queueName, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});

const worker = new Worker(
  queueName,
  async (job: Job) => {
    const { id } = job.data;
    await startExchangeJob(id);
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
);

queue.on("error", (error) => {
  console.log(error);
});

worker.on("error", (error) => {
  console.log(error);
});

export async function addDataImportJob(data: QueueDataType) {
  return await queue.add("read-echange-file", data);
}

export default worker;
