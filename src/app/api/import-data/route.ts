import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import { getImportDataSchema } from "@/lib/schemas";
import {
  addReadFileJobToQueue,
  createExchangeJob,
  getExchangeFilePath,
  getExchangeFileType,
  makeDirectoryFromFullPath,
} from "@/lib/exchange/exchange-jobs";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Test request body
    const formData = await request.formData();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.importDataSchema",
    });
    const test = getImportDataSchema(st).safeParse(
      Object.fromEntries(formData.entries())
    );
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { importType, file } = test.data;

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const filePath = getExchangeFilePath(filename, company.id);

    await makeDirectoryFromFullPath(filePath);

    await writeFile(filePath, buffer);

    const exchangeType = getExchangeFileType(importType);
    if (!exchangeType) {
      return getErrorResponse(
        t("invalidExchangeType"),
        400,
        t("invalidRequest")
      );
    }
    await createExchangeJob(
      company.id,
      filename,
      filePath,
      exchangeType,
      locale
    );

    await addReadFileJobToQueue(company.id, filePath);

    return NextResponse.json(200);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
