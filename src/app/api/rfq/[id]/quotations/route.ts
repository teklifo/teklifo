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

    const [total, result] = await db.$transaction([
      db.quotation.count({
        where: {
          rfq: {
            id,
            latestVersion: true,
          },
        },
      }),
      db.requestForQuotationItem.findMany({
        where: {
          requestForQuotation: {
            id,
            latestVersion: true,
          },
        },
        include: {
          product: {
            select: {
              productId: true,
            },
          },
          quotationItems: {
            take: limit,
            skip: startIndex,
            include: {
              quotation: {
                select: {
                  id: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: [
              {
                quotation: {
                  totalAmount: "asc",
                },
              },
              {
                quotation: {
                  id: "asc",
                },
              },
            ],
          },
        },
        orderBy: {
          lineNumber: "asc",
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
