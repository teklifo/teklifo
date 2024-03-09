import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRFQSchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";
import getPaginationData from "@/lib/pagination";

export async function POST(request: NextRequest) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getCurrentCompany();
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Create a new RFQ
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.rfqSchema",
    });
    const test = getRFQSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      publicRequest,
      currency,
      startDate,
      endDate,
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
        startDate,
        endDate,
        description,
        deliveryAddress,
        deliveryTerms,
        paymentTerms,
        products: {
          create: products.map((product) => ({
            productId: product.productId,
            price: product.price,
            quantity: product.quantity,
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          errors: [{ message: t("pageAndlimitAreRequired") }],
        },
        { status: 400 }
      );

    // Filters
    const filters: Prisma.RequestForQuotationWhereInput = {};
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
