import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getCurrentCompany from "@/app/actions/get-current-company";
import db from "@/lib/db";
import geminiModel from "@/lib/gemini";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";
import { getQuotsAIAnalysisSchema } from "@/lib/schemas";

type Props = {
  params: { rfqId: string };
};

export async function POST(request: NextRequest, { params: { rfqId } }: Props) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    // Find RFQ
    const rfq = await db.requestForQuotation.findFirst({
      where: { id: rfqId, latestVersion: true },
      select: {
        versionId: true,
        id: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.productSchema",
    });
    const test = getQuotsAIAnalysisSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { quotations, rfqItems } = test.data;

    const MAX_QUOTS = 3;
    const MAX_ITEMS = 10;

    const quotationsForAnalysis = quotations.slice(0, MAX_QUOTS);
    const rfqItemsForAnalysis = rfqItems.slice(0, MAX_ITEMS);

    const rfqAndTopQuotations = await db.requestForQuotation.findUnique({
      where: {
        versionId: rfq.versionId,
      },
      select: {
        currency: true,
        items: {
          where: {
            versionId: {
              in: rfqItemsForAnalysis,
            },
          },
          select: {
            versionId: true,
            productName: true,
            quantity: true,
            price: true,
            deliveryDate: true,
          },
        },
        quotations: {
          where: {
            id: {
              in: quotationsForAnalysis,
            },
          },
          select: {
            id: true,
            company: {
              select: {
                name: true,
              },
            },
            totalAmount: true,
            items: {
              where: {
                rfqItemVersionId: {
                  in: rfqItemsForAnalysis,
                },
              },
              select: {
                rfqItemVersionId: true,
                productName: true,
                quantity: true,
                price: true,
                amount: true,
                vatAmount: true,
                amountWithVat: true,
                deliveryDate: true,
                skip: true,
              },
            },
          },
        },
      },
    });

    const result = await geminiModel.generateContent([
      t("topQuotationsPromt"),
      JSON.stringify(rfqAndTopQuotations),
    ]);

    const aiAnalysis = await db.aIQuotationsAnalysis.create({
      data: {
        message: result.response.text(),
        rfqVersionId: rfq.versionId,
        rfqId: rfq.id,
      },
    });

    return NextResponse.json(aiAnalysis);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(request: NextRequest, { params: { rfqId } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    // Find RFQ
    const rfq = await db.requestForQuotation.findFirst({
      where: { id: rfqId, latestVersion: true },
      select: {
        id: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    const aiAnalysis = await db.aIQuotationsAnalysis.findMany({
      where: {
        rfqId: rfq.id,
      },
    });

    return NextResponse.json(aiAnalysis);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
