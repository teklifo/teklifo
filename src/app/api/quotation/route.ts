import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getQuotationSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";
import {
  calculateAmountWithVat,
  calculateVatAmount,
  getVatRatePercentage,
} from "@/lib/calculations";
import getPaginationData from "@/lib/pagination";

export async function POST(request: NextRequest) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Test request body
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.quotationSchema",
    });
    const test = getQuotationSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { rfqVersionId, rfqId, currency, description, products } = test.data;

    console.log(rfqVersionId);

    // Check RFQ
    const rfq = await db.requestForQuotation.findUnique({
      where: {
        versionId: rfqVersionId,
        participants: {
          some: {
            companyId: company.id,
          },
        },
        products: {
          some: {
            versionId: {
              in: products.map((e) => e.rfqRowVersionId),
            },
          },
        },
      },
    });
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 400);
    }

    // Check uniqueness
    const existingQuotation = await db.quotation.findFirst({
      where: {
        companyId: company.id,
        rfqId,
      },
    });
    if (existingQuotation)
      return getErrorResponse(
        t("quotationAlreadyExists", {
          companyName: company.name,
          rfqNumber: rfq.number,
        }),
        400
      );

    const quotation = await db.quotation.create({
      data: {
        companyId: company.id,
        rfqVersionId,
        rfqId,
        userId: company.users.length > 0 ? company.users[0].userId : null,
        currency,
        description,
        products: {
          create: products.map((row) => {
            const { vatRate, vatRatePercentage } = getVatRatePercentage(
              row.vatRate
            );

            const vatAmount = calculateVatAmount(row.amount, vatRatePercentage);

            const amountWithVat = calculateAmountWithVat(
              row.amount,
              vatAmount,
              row.vatIncluded
            );

            return {
              externalId: row.externalId,
              rfqRow: {
                connect: {
                  versionId: row.rfqRowVersionId,
                },
              },
              rfqRowId: row.rfqRowId,
              product: {
                connect: {
                  id: row.productId,
                },
              },
              quantity: row.quantity,
              price: row.price,
              amount: row.amount,
              vatRate,
              vatAmount,
              vatIncluded: row.vatIncluded,
              amountWithVat,
              deliveryDate: row.deliveryDate,
              comment: row.comment,
              skip: row.skip,
            };
          }),
        },
      },
      include: {
        products: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(request: NextRequest) {
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

    // Filters
    const filters: Prisma.QuotationWhereInput = {};
    filters.OR = [
      {
        companyId: company.id,
      },
      {
        rfq: {
          companyId: company.id,
        },
      },
    ];

    if (request.nextUrl.searchParams.get("companyId"))
      filters.companyId = request.nextUrl.searchParams.get("companyId") ?? "";

    if (request.nextUrl.searchParams.get("rfqCompanyId"))
      filters.rfq = {
        companyId: request.nextUrl.searchParams.get("rfqCompanyId") ?? "",
      };

    const [total, result] = await db.$transaction([
      db.quotation.count({
        where: filters,
      }),
      db.quotation.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        orderBy: {
          createdAt: "desc",
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
