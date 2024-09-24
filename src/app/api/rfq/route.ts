import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRFQSchema } from "@/lib/schemas";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

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

    // Create a new RFQ
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.rfqSchema",
    });
    const test = getRFQSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const {
      externalId,
      title,
      privateRequest,
      currency,
      endDate,
      contactPerson,
      email,
      phone,
      description,
      deliveryAddress,
      deliveryTerms,
      paymentTerms,
      items,
    } = test.data;

    const rfq = await db.requestForQuotation.create({
      data: {
        externalId,
        companyId: company.id,
        userId: company.users[0].userId,
        title,
        privateRequest,
        currency,
        endDate,
        contactPerson,
        email,
        phone,
        description,
        deliveryAddress,
        deliveryTerms,
        paymentTerms,
        items: {
          create: items.map((product, index) => ({
            lineNumber: index++,
            externalId: product.externalId,
            productName: product.productName,
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            deliveryDate: product.deliveryDate,
            comment: product.comment,
          })),
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(rfq);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(request: NextRequest) {
  const { t } = await getTranslationsFromHeader(request.headers);
  const company = await getCurrentCompany();

  const searchParams = request.nextUrl.searchParams;

  try {
    const page = parseInt(searchParams.get("page") as string, 10);
    const limit = parseInt(searchParams.get("limit") as string, 10);

    const startIndex = (page - 1) * limit;

    if (!page || !limit)
      return getErrorResponse(t("pageAndlimitAreRequired"), 400);

    // Filters
    const filters: Prisma.RequestForQuotationWhereInput = {
      latestVersion: true,
    };
    filters.OR = [
      {
        privateRequest: false,
      },
      {
        participants: {
          some: {
            companyId: company ? company.id : "",
          },
        },
      },
      {
        companyId: company ? company.id : "",
      },
    ];

    if (searchParams.get("companyId"))
      filters.companyId = {
        in: searchParams.get("companyId")?.split(",") ?? [],
      };

    if (searchParams.get("endDateFrom") || searchParams.get("endDateFrom")) {
      filters.AND = [
        {
          endDate: {
            gte: searchParams.get("endDateFrom") || undefined,
          },
        },
        {
          endDate: {
            lte: searchParams.get("endDateTo") || undefined,
          },
        },
      ];
    }

    if (searchParams.get("participantId"))
      filters.participants = {
        some: {
          companyId: searchParams.get("participantId") ?? "",
        },
      };

    const [total, result] = await db.$transaction([
      db.requestForQuotation.count({
        where: filters,
      }),
      db.requestForQuotation.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        include: {
          company: true,
          _count: {
            select: {
              quotations: {
                where: {
                  OR: [
                    {
                      companyId: company?.id ?? "",
                    },
                    {
                      rfq: {
                        companyId: company?.id ?? "",
                      },
                    },
                  ],
                },
              },
            },
          },
        },
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
