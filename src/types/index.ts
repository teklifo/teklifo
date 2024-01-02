import { ZodIssue } from "zod";

export type EmailType = "email-verification";

export type EmailContextType = {
  [key: string]: string;
};

export type ApiError = {
  message: string;
  errors: ZodIssue[];
};

export type PaginationType = {
  skipped: number;
  current: number;
  total: number;
};

export type FlattenAvailableDataType = { stockId: string; priceTypeId: string };
