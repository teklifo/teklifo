import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import db from "@/lib/db";
import { getProductsSchema } from "@/lib/schemas";
import { upsertProduct } from "@/lib/exchange/bulk-import";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader } from "@/lib/utils";

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
  const { t, locale } = await getTranslationsFromHeader(request.headers);

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
          id,
          externalId,
          name,
          number,
          brand,
          brandNumber,
          unit,
          description,
          archive,
          companyId: company.id,
        };

        const product = await upsertProduct(data);

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

    const role = company.users[0].companyRole;

    // Allowed prices
    const priceTypes = role.availableData.map((e) => e.priceTypeId);

    // Allowed stocks
    const stocks = role.availableData.map((e) => e.stockId);

    const filters: Prisma.ProductWhereInput = {};
    filters.companyId = company.id;
    if (!role.default) {
      // Display only products with prices
      filters.prices = {
        some: {
          priceTypeId: {
            in: priceTypes,
          },
          price: {
            gt: 0,
          },
        },
      };
    }

    // Get allowed products
    const [total, result] = await db.$transaction([
      db.product.count({
        where: filters,
      }),
      db.product.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        include: {
          prices: {
            where: role.default
              ? undefined
              : {
                  priceTypeId: {
                    in: priceTypes,
                  },
                },
            include: {
              priceType: true,
            },
          },
          stock: {
            where: role.default
              ? undefined
              : {
                  stockId: {
                    in: stocks,
                  },
                },
            include: {
              stock: true,
            },
            orderBy: {
              quantity: "desc",
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
