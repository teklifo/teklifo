import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type { ZodIssue } from "zod";
import { locales } from "@/navigation";

export async function getLocale(headers: Headers) {
  const locale = headers.get("Accept-Language") ?? "en";

  if (!(locales as readonly string[]).includes(locale)) {
    return "en";
  }
  return locale;
}

export async function getTranslationsFromHeader(headers: Headers) {
  const locale = await getLocale(headers);
  const t = await getTranslations({ locale, namespace: "API" });

  return { t, locale };
}

export function getErrorResponse(
  errors: string | ZodIssue[],
  status: number,
  message?: string
) {
  return NextResponse.json(
    {
      message,
      errors: typeof errors === "string" ? [{ message: errors }] : errors,
    },
    { status }
  );
}

export function formatWebsiteUrl(website: string | undefined) {
  if (
    !website ||
    website.startsWith("http://") ||
    website.startsWith("https://")
  )
    return website;
  return `http://${website}`;
}
