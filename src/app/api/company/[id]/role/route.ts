import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRoleSchema } from "@/lib/schemas";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";
import { FlattenAvailableDataType } from "@/types";

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

    // Create a new role
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.roleSchema",
    });
    const test = getRoleSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { name, availableData } = test.data;

    const flattenData: FlattenAvailableDataType[] = [];
    availableData.forEach((s) =>
      s.priceTypes.forEach((p) => {
        flattenData.push({ stockId: s.stockId, priceTypeId: p.priceTypeId });
      })
    );

    const role = await db.companyRole.create({
      data: {
        name,
        default: false,
        company: {
          connect: {
            id: company.id,
          },
        },
        availableData: {
          createMany: {
            data: flattenData,
          },
        },
      },
    });

    return NextResponse.json(role);
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
    const filters: Prisma.CompanyRoleWhereInput = {};
    filters.companyId = company.id;

    // Get allowed roles
    const [total, result] = await db.$transaction([
      db.companyRole.count({
        where: filters,
      }),
      db.companyRole.findMany({
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
