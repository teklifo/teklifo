import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getPriceTypeSchema } from "@/lib/schemas";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params: { id } }: Props) {
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

    // Create a new priceType
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

    const priceType = await db.priceType.create({
      data: {
        name,
        currency,
        company: {
          connect: {
            id: company.id,
          },
        },
      },
    });

    return NextResponse.json(priceType);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const page = parseInt(
      request.nextUrl.searchParams.get("page") as string,
      10
    );
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") as string,
      10
    );

    const startIndex = (page - 1) * limit;

    if (!page || !limit)
      return getErrorResponse(t("pageAndlimitAreRequired"), 400);

    // Check company
    const company = await getUserCompany(id);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    // Filters
    const filters: Prisma.PriceTypeWhereInput = {};
    filters.companyId = company.id;
    if (!company.users[0].companyRole.default)
      filters.id = {
        in: company.users[0].companyRole.availableData.map(
          (e) => e.priceTypeId
        ),
      };

    // Get allowed priceTypes
    const [total, result] = await db.$transaction([
      db.priceType.count({
        where: filters,
      }),
      db.priceType.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        orderBy: {
          name: "desc",
        },
      }),
    ]);

    const pagination = getPaginationData(startIndex, page, limit, total);

    return NextResponse.json({
      result,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
