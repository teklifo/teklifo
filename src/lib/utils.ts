import fs from "fs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getTranslations } from "next-intl/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fileExists(file: string) {
  return fs.promises
    .access(file, fs.constants.F_OK)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}

export async function getLocale(headers: Headers) {
  const acceptedLanguagues = ["az", "ru"];

  const locale = headers.get("Accept-Language") ?? "az";

  if (!acceptedLanguagues.includes(locale)) {
    return "az";
  }
  return locale;
}

export async function getTranslationsFromHeader(headers: Headers) {
  const locale = await getLocale(headers);
  const t = await getTranslations({ locale: "ru", namespace: "API" });

  return { t, locale };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
