import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
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
        rfq: {
          include: {
            company: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
            rfqItem: true,
          },
          orderBy: {
            rfqItem: {
              lineNumber: "asc",
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

    const { rfqVersionId, rfqId, currency, description, items } = test.data;

    // Find quotation
    const existingQuotation = await db.quotation.findUnique({
      where: {
        id: parseInt(id),
        rfq: {
          latestVersion: true,
        },
      },
      include: {
        rfq: true,
      },
    });

    if (!existingQuotation) {
      return getErrorResponse(t("invalidQuotationId"), 404);
    }

    if (existingQuotation.rfq.endDate < new Date()) {
      return getErrorResponse(t("rfqIsCompleted"), 400);
    }

    // Delete previous items
    await db.quotationItem.deleteMany({
      where: {
        quotationId: existingQuotation.id,
      },
    });

    // Update quotation
    let totalAmount = 0;

    const quotationProducts = {
      create: items.map((item) => {
        const { vatRate, vatRatePercentage } = getVatRatePercentage(
          item.vatRate
        );

        const vatAmount = calculateVatAmount(item.amount, vatRatePercentage);

        const amountWithVat = calculateAmountWithVat(
          item.amount,
          vatAmount,
          item.vatIncluded
        );

        totalAmount = totalAmount + (item.skip ? 0 : amountWithVat);

        return {
          externalId: item.externalId,
          rfqItem: {
            connect: {
              versionId: item.rfqItemVersionId,
            },
          },
          rfqItemId: item.rfqItemId,
          productName: item.productName,
          product: {
            connect: {
              id: item.productId,
            },
          },
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
          vatRate,
          vatAmount,
          vatIncluded: item.vatIncluded,
          amountWithVat,
          deliveryDate: item.deliveryDate,
          comment: item.comment,
          skip: item.skip,
        };
      }),
    };

    const updatedQuotation = await db.quotation.update({
      where: {
        id: parseInt(id),
      },
      data: {
        companyId: company.id,
        rfqVersionId,
        rfqId,
        userId: company.users[0].userId,
        currency,
        description,
        totalAmount,
        items: quotationProducts,
      },
      include: {
        items: true,
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
