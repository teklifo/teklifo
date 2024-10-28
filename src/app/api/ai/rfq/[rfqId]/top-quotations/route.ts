import { NextRequest, NextResponse } from "next/server";
import { getTopQuotationItemsPerRFQ } from "@prisma/client/sql";
import getCurrentCompany from "@/app/actions/get-current-company";
import db from "@/lib/db";
import geminiModel from "@/lib/gemini";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { rfqId: string };
};

export async function GET(request: NextRequest, { params: { rfqId } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const MAX_ITEMS = 10;

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
        items: {
          take: MAX_ITEMS,
          orderBy: {
            price: "desc",
          },
        },
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    const topQuotations = await db.$queryRawTyped(
      getTopQuotationItemsPerRFQ(rfqId)
    );

    const topThreeQuotations = topQuotations.slice(0, 4);
    const topThreeQuotationsId = topThreeQuotations.map(
      (quotation) => quotation.quotationid
    );

    const itemsForAnalysis = rfq.items.map((item) => item.versionId);

    const rfqAndTopQuotations = await db.requestForQuotation.findUnique({
      where: {
        versionId: rfq.versionId,
      },
      select: {
        currency: true,
        items: {
          where: {
            versionId: {
              in: itemsForAnalysis,
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
              in: topThreeQuotationsId,
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
                  in: itemsForAnalysis,
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

    return NextResponse.json({
      result: result.response.text(),
    });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
