import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getStockSchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string; stockId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, stockId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getUserCompany(id);
    const isAdmin = await isCompanyAdmin(id);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    } else if (!isAdmin) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, stockId } }: Props
) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getUserCompany(id);
    const isAdmin = await isCompanyAdmin(id);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    } else if (!isAdmin) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Update a stock
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.stockSchema",
    });
    const test = getStockSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
