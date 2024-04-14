import { NextRequest, NextResponse } from "next/server";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, { params: { id } }: Props) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getCurrentCompany();
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Update RFQ
    const rfq = await db.requestForQuotation.findUnique({
      where: {
        id: id ?? "",
      },
    });

    if (!rfq) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRFQId") }],
        },
        { status: 404 }
      );
    }

    const updatedRfq = await db.requestForQuotation.update({
      where: {
        id,
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
        products: true,
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
