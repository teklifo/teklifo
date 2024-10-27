import { Prisma } from "@prisma/client";
import db from "../db";

export async function exchangeLog(log: Prisma.ExchangeLogUncheckedCreateInput) {
  try {
    await db.exchangeLog.create({
      data: log,
    });
  } catch (error) {
    // No action
  }
}
