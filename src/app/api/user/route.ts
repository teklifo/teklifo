import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
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

    // Filters
    let filters: Prisma.UserWhereInput = {};
    if (request.nextUrl.searchParams.get("email"))
      filters = {
        email: request.nextUrl.searchParams.get("email") ?? "",
      };

    const [total, result] = await db.$transaction([
      db.user.count({
        where: filters,
      }),
      db.user.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          userImage: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            select: {
              company: {
                include: {
                  image: true,
                },
              },
              companyRole: true,
            },
          },
        },
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
