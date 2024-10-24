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
    let isAdmin = false;
    let allowedStocks: string[] = [];

    const company = await getCurrentCompany();

    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 401);
    }

    if (company) {
      const role = company.users[0].companyRole;
      isAdmin = await isCompanyAdmin(company.id);
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

    // Check that product exists
    const product = await db.product.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!product) {
      return getErrorResponse(t("invalidProductId"), 404);
    }

    // Get all product quantity by stocks
    const stocks = await db.stock.findMany({
      where: {
        companyId: company.id,
        id: {
          in: isAdmin ? undefined : allowedStocks,
        },
      },
      include: {
        balance: {
          where: {
            productId: parseInt(id),
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ product, stocks });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
