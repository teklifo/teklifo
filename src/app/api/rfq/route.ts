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
      publicRequest,
      currency,
      date,
      description,
      deliveryAddress,
      deliveryTerms,
      paymentTerms,
      products,
    } = test.data;

    const rfq = await db.requestForQuotation.create({
      data: {
        companyId: company.id,
        userId: company.users.length > 0 ? company.users[0].userId : null,
        publicRequest,
        currency,
        startDate: date.from,
        endDate: date.to,
        description,
        deliveryAddress,
        deliveryTerms,
        paymentTerms,
        products: {
          create: products.map((product) => ({
            externalId: product.externalId,
            productId: product.productId,
            quantity: product.quantity,
            price: product.price,
            deliveryDate: product.deliveryDate,
            comment: product.comment,
          })),
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

    return NextResponse.json(rfq);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(request: NextRequest) {
  const { t } = await getTranslationsFromHeader(request.headers);
  const company = await getCurrentCompany();

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
    const filters: Prisma.RequestForQuotationWhereInput = {
      latestVersion: true,
    };
    filters.OR = [
      {
        publicRequest: true,
      },
      {
        participants: {
          some: {
            companyId: company ? company.id : undefined,
          },
        },
      },
      {
        companyId: company ? company.id : undefined,
      },
    ];

    if (request.nextUrl.searchParams.get("companyId"))
      filters.companyId = request.nextUrl.searchParams.get("companyId") ?? "";

    if (request.nextUrl.searchParams.get("participantId"))
      filters.participants = {
        some: {
          companyId: request.nextUrl.searchParams.get("participantId") ?? "",
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
