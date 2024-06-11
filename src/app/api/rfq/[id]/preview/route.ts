import { NextRequest, NextResponse } from "next/server";
import getCurrentCompany from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const company = await getCurrentCompany();

  try {
    const rfq = await db.requestForQuotation.findFirst({
      where: {
        id,
        latestVersion: true,
      },
      select: {
        id: true,
        company: true,
        participants: {
          where: {
            companyId: company?.id,
          },
        },
        privateRequest: true,
        createdAt: true,
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
