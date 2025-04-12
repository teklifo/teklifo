import fs from "fs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as loc from "date-fns/locale";

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

export function dateFnsLocale(locale: string) {
  let datefns = loc.enUS;
  if (locale === "ru") datefns = loc.ru;
  if (locale === "az") datefns = loc.az;
  return datefns;
}
