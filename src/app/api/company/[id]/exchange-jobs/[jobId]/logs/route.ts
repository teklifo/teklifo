import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { getUserCompany } from "@/app/actions/get-current-company";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string; jobId: string };
};

export async function GET(
  request: NextRequest,
  { params: { id: companyId, jobId } }: Props
) {
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
    const company = await getUserCompany(companyId);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    // Find exchange job
    const exchangeJob = await db.exchangeJob.findUnique({
      where: {
        id: jobId,
        companyId: companyId,
      },
    });
    if (!exchangeJob) {
      return getErrorResponse(t("invalidExchangeJobId"), 404);
    }

    // Filters
    const filters: Prisma.ExchangeLogWhereInput = {};
    filters.exchangeJobId = exchangeJob.id;

    // Get exchange jobs
    const [total, result] = await db.$transaction([
      db.exchangeLog.count({
        where: filters,
      }),
      db.exchangeLog.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        orderBy: {
          createdAt: "asc",
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
