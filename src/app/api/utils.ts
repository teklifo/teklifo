import { NextResponse } from "next/server";
import type { ZodIssue } from "zod";

export function getErrorResponse(
  errors: string | ZodIssue[],
  status: number,
  message?: string
) {
  return NextResponse.json(
    {
      message,
      errors: typeof errors === "string" ? [{ errors }] : errors,
    },
    { status }
  );
}
