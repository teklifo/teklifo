import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRFQSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const rfq = await db.requestForQuotation.findFirst({
      where: { id, latestVersion: true },
      include: {
        company: true,
        products: {
          include: {
            product: true,
          },
        },
        participants: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(request: NextRequest, { params: { id } }: Props) {
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

    // Test request body
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
      startDate,
      endDate,
      description,
      deliveryAddress,
      deliveryTerms,
      paymentTerms,
      products,
    } = test.data;

    // Find and check RFQ
    const previousRfqVersion = await db.requestForQuotation.findFirst({
      where: {
        id: id ?? "",
        latestVersion: true,
      },
      include: {
        products: true,
      },
    });

    if (!previousRfqVersion) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    if (previousRfqVersion.companyId !== company.id) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Prev version is not latest anymore
    await db.requestForQuotation.update({
      where: {
        versionId: previousRfqVersion.versionId,
      },
      data: {
        latestVersion: false,
      },
    });

    // Create new version of RFQ
    const newRfqVersion = await db.requestForQuotation.create({
      data: {
        id: previousRfqVersion.id,
        number: previousRfqVersion.number,
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
      },
    });

    const productsDataUnfiltered = products.map((product) => {
      const existingRfqLine = previousRfqVersion.products.find(
        (existingProduct) => existingProduct.id === product.id
      );
      if (product.id && !existingRfqLine) return null;

      const productData: Prisma.RequestForQuotationProductsCreateManyInput =
        existingRfqLine
          ? {
              ...existingRfqLine,
              versionId: undefined,
              requestForQuotationId: newRfqVersion.versionId,
            }
          : {
              requestForQuotationId: newRfqVersion.versionId,
              productId: product.productId,
              externalId: product.externalId,
              price: product.price,
              quantity: product.quantity,
              deliveryDate: product.deliveryDate,
              comment: product.comment,
            };

      return productData;
    });

    const productsData: Prisma.RequestForQuotationProductsCreateManyInput[] =
      productsDataUnfiltered.filter(
        (
          productData
        ): productData is Prisma.RequestForQuotationProductsCreateManyInput =>
          productData !== null
      );

    console.log(productsData);

    await db.requestForQuotationProducts.createMany({
      data: productsData,
    });

    const newRfqVersionWithProducts = await db.requestForQuotation.findUnique({
      where: {
        versionId: newRfqVersion.versionId,
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

    return NextResponse.json(newRfqVersionWithProducts);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function DELETE(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

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

    const rfq = await db.requestForQuotation.findFirst({
      where: { id, latestVersion: true },
      include: {
        company: true,
        products: {
          include: {
            product: true,
          },
        },
        participants: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    if (rfq.companyId !== company.id) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Delete RFQ
    await db.requestForQuotation.deleteMany({
      where: {
        id: rfq.id,
      },
    });

    return NextResponse.json({ message: t("rfqDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
