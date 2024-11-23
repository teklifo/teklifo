import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getProductsSchema } from "@/lib/schemas";
import { upsertProduct } from "@/lib/exchange/bulk-import";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type UpsertResult = {
  index: number;
  id: number;
  externalId: string | null;
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
    const test = getProductsSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const result: UpsertResult[] = [];

    await db.$transaction(async () => {
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

          const product = await upsertProduct(data, false);

          result.push({
            index,
            id: product.id,
            externalId: product.externalId,
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

export async function DELETE(request: NextRequest) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) return getErrorResponse(t("idsAreRequired"), 400);

  const productIds = ids.split(",").map((id) => parseInt(id));

  try {
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    const products = await db.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        companyId: true,
      },
    });

    const errors: string[] = [];
    productIds.map((id) => {
      const product = products.find((value) => value.id === id);
      if (!product || product.companyId !== company.id) {
        errors.push(
          t("productNotFound", {
            id,
          })
        );
      }
    });

    if (errors.length > 0) {
      return getErrorResponse(errors.join(", "), 400);
    }

    await db.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    return NextResponse.json({ message: t("productsDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
