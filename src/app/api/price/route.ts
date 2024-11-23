import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { upsertPrices } from "@/lib/exchange/bulk-import";
import { getPriceSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type UpsertResult = {
  index: number;
  productId: number;
  priceTypeId: string;
  price: number;
};

export async function POST(request: NextRequest) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }
    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.productSchema",
    });
    const test = getPriceSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const result: UpsertResult[] = [];

    await db.$transaction(async () => {
      await Promise.all(
        test.data.prices.map(async (productData, index) => {
          const { productId, priceTypeId, price } = productData;

          const data = {
            priceTypeId,
            productId,
            price,
          };

          const productPrice = await upsertPrices(data);

          result.push({
            index,
            productId: productPrice.productId,
            priceTypeId: productPrice.priceTypeId,
            price: Number(productPrice.price),
          });
        })
      );
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
