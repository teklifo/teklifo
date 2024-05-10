import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getQuotationSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";
import {
  calculateAmountWithVat,
  calculateVatAmount,
  getVatRatePercentage,
} from "@/lib/calculations";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const rfq = await db.quotation.findFirst({
      where: { id: parseInt(id) },
      include: {
        company: true,
        products: {
          include: {
            product: true,
            rfqRow: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Quotation not found
    if (!rfq) {
      return getErrorResponse(t("invalidQuotationId"), 404);
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
      namespace: "Schemas.quotationSchema",
    });
    const test = getQuotationSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { rfqId, currency, description, products } = test.data;

    // Find quotation
    const existingQuotation = await db.quotation.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!existingQuotation) {
      return getErrorResponse(t("invalidQuotationId"), 404);
    }

    // Delete previous products
    await db.quotationProducts.deleteMany({
      where: {
        quotationId: existingQuotation.id,
      },
    });

    // Update quotation
    const updatedQuotation = await db.quotation.update({
      where: {
        id: parseInt(id),
      },
      data: {
        companyId: company.id,
        rfqId,
        userId: company.users.length > 0 ? company.users[0].userId : null,
        currency,
        description,
        products: {
          create: products.map((product) => {
            const { vatRate, vatRatePercentage } = getVatRatePercentage(
              product.vatRate
            );

            const vatAmount = calculateVatAmount(
              product.amount,
              vatRatePercentage
            );

            const amountWithVat = calculateAmountWithVat(
              product.amount,
              vatAmount,
              product.vatIncluded
            );

            return {
              externalId: product.externalId,
              rfqRow: {
                connect: {
                  versionId: product.rfqRowId,
                },
              },
              product: {
                connect: {
                  id: product.productId,
                },
              },
              quantity: product.quantity,
              price: product.price,
              amount: product.amount,
              vatRate,
              vatAmount,
              vatIncluded: product.vatIncluded,
              amountWithVat,
              deliveryDate: product.deliveryDate,
              comment: product.comment,
            };
          }),
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

    return NextResponse.json(updatedQuotation);
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

    const quotation = await db.quotation.findFirst({
      where: { id: parseInt(id) },
    });

    // Quotation not found
    if (!quotation) {
      return getErrorResponse(t("invalidQuotationId"), 404);
    }

    if (quotation.companyId !== company.id) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Delete quotation
    await db.quotation.deleteMany({
      where: {
        id: quotation.id,
      },
    });

    return NextResponse.json({ message: t("quotationDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
