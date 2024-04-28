import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getStockSchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";
import { getErrorResponse } from "@/app/api/utils";

type Props = {
  params: { id: string; stockId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, stockId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getUserCompany(id);
    const isAdmin = await isCompanyAdmin(id);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    } else if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Delete a stock
    await db.stock.delete({
      where: {
        id: stockId,
      },
    });

    return NextResponse.json({ message: t("stockDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, stockId } }: Props
) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getUserCompany(id);
    const isAdmin = await isCompanyAdmin(id);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    } else if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Update a stock
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.stockSchema",
    });
    const test = getStockSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { name } = test.data;

    const stock = await db.stock.update({
      where: {
        id: stockId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(stock);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
