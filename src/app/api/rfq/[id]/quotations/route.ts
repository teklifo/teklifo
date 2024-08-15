import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";
import getPaginationData from "@/lib/pagination";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);
  const company = await getCurrentCompany();
  if (!company) {
    return getErrorResponse(t("invalidCompanyId"), 404);
  }

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

    const filters: Prisma.QuotationWhereInput = {};
    filters.rfqId = id;
    filters.rfq = {
      latestVersion: true,
    };

    const [total, result] = await db.$transaction([
      db.quotation.count({
        where: filters,
      }),
      db.quotation.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        include: {
          company: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          totalAmount: "asc",
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
