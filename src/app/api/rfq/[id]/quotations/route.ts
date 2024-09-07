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

  const rfq = await db.requestForQuotation.findFirst({
    where: {
      id: id ?? "",
      latestVersion: true,
    },
  });

  if (!rfq) {
    return getErrorResponse(t("invalidRFQId"), 404);
  }

  if (rfq.companyId !== company.id) {
    return getErrorResponse(t("notAllowed"), 401);
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

    const order = request.nextUrl.searchParams.get("order");
    let orderBy: Prisma.QuotationOrderByWithRelationInput = {
      totalAmount: "asc",
    };
    if (order === "amountDesc") orderBy = { totalAmount: "desc" };
    if (order === "dateDesc") orderBy = { updatedAt: "desc" };
    if (order === "dateAsc") orderBy = { updatedAt: "asc" };

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
              id: true,
            },
          },
          quotationItems: {
            take: limit,
            skip: startIndex,
            include: {
              quotation: {
                select: {
                  id: true,
                  totalAmount: true,
                  currency: true,
                  vatIncluded: true,
                  rfq: {
                    select: {
                      latestVersion: true,
                    },
                  },
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
                  ...orderBy,
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
