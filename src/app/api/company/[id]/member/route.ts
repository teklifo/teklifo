import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { getUserCompany } from "@/app/actions/get-current-company";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader } from "@/lib/utils";
import { getErrorResponse } from "@/app/api/utils";

type Props = {
  params: { id: string };
};

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
    const filters: Prisma.CompanyMembersWhereInput = {};
    filters.companyId = company.id;

    // Get members
    const [total, result] = await db.$transaction([
      db.companyMembers.count({
        where: filters,
      }),
      db.companyMembers.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        include: {
          user: true,
          companyRole: true,
        },
        orderBy: {
          userId: "desc",
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
