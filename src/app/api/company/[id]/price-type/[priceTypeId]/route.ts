import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getPriceTypeSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string; priceTypeId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, priceTypeId } }: Props
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

    // Delete a price type
    await db.priceType.delete({
      where: {
        id: priceTypeId,
      },
    });

    return NextResponse.json({ message: t("priceTypeDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, priceTypeId } }: Props
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

    // Update a price type
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.priceTypeSchema",
    });
    const test = getPriceTypeSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { name, currency } = test.data;

    const priceType = await db.priceType.update({
      where: {
        id: priceTypeId,
      },
      data: {
        name,
        currency,
      },
    });

    return NextResponse.json(priceType);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
