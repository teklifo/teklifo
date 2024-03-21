import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getCurrentUser from "@/app/actions/get-current-user";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const rfq = await db.requestForQuotation.findUnique({
      where: { id },
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
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRFQId") }],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
