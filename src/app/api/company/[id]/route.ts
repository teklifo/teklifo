import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import getCurrentUser from "@/app/actions/get-current-user";
import getLocale from "@/lib/getLocale";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAuthorized") }],
        },
        { status: 401 }
      );
    }

    const company = await db.company.findUnique({
      where: { id },
      include: { users: true },
    });

    // Company not found
    if (!company) {
      return NextResponse.json({
        errors: [{ message: t("invalidCompanyId") }],
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
