import fs from "fs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as loc from "date-fns/locale";
import { formatRelative } from "date-fns";

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

export function localizedRelativeDate(
  date: Date,
  baseDate: Date,
  locale: string
) {
  let dateLocale = loc.enUS;
  if (locale === "ru") dateLocale = loc.ru;

  return formatRelative(date, baseDate, {
    locale: {
      ...dateLocale,
      formatRelative: (token) =>
        token === "other"
          ? "dd.MM.yyyy"
          : dateLocale.formatRelative(token, date, baseDate),
    },
  });
}
