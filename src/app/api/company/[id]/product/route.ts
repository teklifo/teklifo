import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import db from "@/lib/db";
import { getProductsSchema } from "@/lib/schemas";
import getPaginationData from "@/lib/pagination";
import getLocale from "@/lib/get-locale";

type Props = {
  params: { id: string };
};

type UpsertResult = {
  index: number;
  id: number;
  externalId: string | null;
};

export async function POST(
  request: NextRequest,
  { params: { id: companyId } }: Props
) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

  try {
    // Find company
    const company = await getAllowedCompany(companyId);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    // Create a new product
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.productSchema",
    });
    const test = getProductsSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
    }

    const result: UpsertResult[] = [];

    await Promise.all(
      test.data.map(async (productData, index) => {
        const {
          id,
          externalId,
          name,
          number,
          brand,
          brandNumber,
          unit,
          description,
          archive,
        } = productData;

        const data = {
          externalId,
          name,
          number,
          brand,
          brandNumber,
          unit,
          description,
          archive,
          company: {
            connect: {
              id: company.id,
            },
          },
        };

        const product = await db.product.upsert({
          where: {
            id: id ? id : 0,
          },
          create: data,
          update: data,
        });

        result.push({
          index,
          id: product.id,
          externalId: product.externalId,
        });
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

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

    // Find company
    const company = await getAllowedCompany(id, false);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    // Filters
    const filters: Prisma.ProductWhereInput = {};
    filters.companyId = company.id;
    if (!company.users[0].companyRole.default) {
      filters.prices = {
        some: {
          priceTypeId: {
            in: company.users[0].companyRole.availableData.map(
              (e) => e.priceTypeId
            ),
          },
        },
      };
      filters.stock = {
        some: {
          stockId: {
            in: company.users[0].companyRole.availableData.map(
              (e) => e.stockId
            ),
          },
        },
      };
    }

    // Get allowed products
    const [total, result] = await db.$transaction([
      db.product.count(),
      db.product.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
