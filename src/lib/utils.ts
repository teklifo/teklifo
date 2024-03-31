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
  const acceptedLanguagues = ["en", "ru"];

  const locale = headers.get("Accept-Language") ?? "en";

  if (!acceptedLanguagues.includes(locale)) {
    return "en";
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

export function getAvatarFallback(text: string) {
  let avatarFallback = "T";
  const match = text.match(/[a-zA-Zа-яА-Я]/);
  if (match) {
    avatarFallback = match[0].toUpperCase();
  }
  return avatarFallback;
}
