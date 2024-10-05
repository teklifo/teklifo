import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getProductsSchema } from "@/lib/schemas";
import { upsertProduct } from "@/lib/exchange/bulk-import";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type UpsertResult = {
  index: number;
  id: number;
  externalId: string | null;
};

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

    // Create a new product
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.productSchema",
    });
    const test = getProductsSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
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
    return getErrorResponse(t("serverError"), 500);
  }
}

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

    let isAdmin = false;
    let allowedPriceTypes: string[] = [];
    let allowedStocks: string[] = [];

    const company = await getCurrentCompany();
    if (company) {
      const role = company.users[0].companyRole;
      isAdmin = await isCompanyAdmin(company.id);
      allowedPriceTypes = role.availableData.map((e) => e.priceTypeId);
      allowedStocks = role.availableData.map((e) => e.stockId);
    }

    const filters: Prisma.ProductWhereInput = {};

    const query = request.nextUrl.searchParams.get("query");
    if (query)
      filters.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          number: {
            contains: query,
            mode: "insensitive",
          },
        },
      ];

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
            where: isAdmin
              ? undefined
              : {
                  priceTypeId: {
                    in: allowedPriceTypes,
                  },
                },
            include: {
              priceType: true,
            },
          },
          stock: {
            where: isAdmin
              ? undefined
              : {
                  stockId: {
                    in: allowedStocks,
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
    return getErrorResponse(t("serverError"), 500);
  }
}
