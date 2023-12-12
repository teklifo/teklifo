import { ZodIssue } from "zod";

export type EmailType = "email-verification";

export type EmailContextType = {
  [key: string]: string;
};

export type ApiError = {
  message: string;
  errors: ZodIssue[];
};
