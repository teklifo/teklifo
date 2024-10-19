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
    let allowedPriceTypes: string[] = [];

    const company = await getCurrentCompany();

    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 401);
    }

    if (company) {
      const role = company.users[0].companyRole;
      isAdmin = await isCompanyAdmin(company.id);
      allowedPriceTypes = role.availableData.map((e) => e.priceTypeId);
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

    // Get all product prices by price types
    const priceTypes = await db.priceType.findMany({
      where: {
        companyId: company.id,
        id: {
          in: isAdmin ? undefined : allowedPriceTypes,
        },
      },
      include: {
        prices: {
          where: {
            productId: parseInt(id),
          },
        },
      },
    });

    return NextResponse.json({ product, priceTypes });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
