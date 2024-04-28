import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getCompanySchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";
import { getErrorResponse } from "../../utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const company = await db.company.findUnique({
      where: { id },
    });

    // Company not found
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    return NextResponse.json(company);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function DELETE(request: NextRequest, { params: { id } }: Props) {
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

    // Delete a company
    await db.company.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: t("companyDeleted", { companyName: company.name }),
    });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id: companyId } }: Props
) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getUserCompany(companyId);
    const isAdmin = await isCompanyAdmin(companyId);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    } else if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Update a company
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.companySchema",
    });
    const test = getCompanySchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { id, name, tin, description, descriptionRu, slogan, sloganRu } =
      test.data;

    const updatedCompany = await db.company.update({
      where: {
        id: companyId,
      },
      data: {
        id,
        name,
        tin,
        description,
        descriptionRu,
        slogan,
        sloganRu,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
