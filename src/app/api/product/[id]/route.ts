import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    let allowedPriceTypes: string[] = [];
    let allowedStocks: string[] = [];

    const currentCompany = await getCurrentCompany();
    if (currentCompany) {
      const role = currentCompany.users[0].companyRole;
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

    // Get product
    const product = await db.product.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        prices: {
          where: {
            OR: [
              {
                product: { companyId: currentCompany?.id },
              },
              {
                priceTypeId: {
                  in: allowedPriceTypes,
                },
              },
            ],
          },
          include: {
            priceType: true,
          },
          orderBy: {
            priceType: {
              name: "asc",
            },
          },
        },
        stock: {
          where: {
            OR: [
              {
                product: { companyId: currentCompany?.id },
              },
              {
                stockId: {
                  in: allowedStocks,
                },
              },
            ],
          },
          include: {
            stock: true,
          },
          orderBy: {
            stock: {
              name: "asc",
            },
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
