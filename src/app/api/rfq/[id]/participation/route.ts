import { NextRequest, NextResponse } from "next/server";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, { params: { id } }: Props) {
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

    // Update RFQ
    const rfq = await db.requestForQuotation.findFirst({
      where: {
        id: id ?? "",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    const updatedRfq = await db.requestForQuotation.update({
      where: {
        versionId: rfq.versionId,
      },
      data: {
        participants: {
          upsert: {
            where: {
              requestForQuotationId_companyId: {
                requestForQuotationId: id,
                companyId: company.id,
              },
            },
            create: {
              companyId: company.id,
            },
            update: {
              companyId: company.id,
            },
          },
        },
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

    return NextResponse.json(updatedRfq);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
