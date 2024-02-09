import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import db from "@/lib/db";
import { getInvitationSchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params: { id } }: Props) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getAllowedCompany(id);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    // Create a new invitation
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.invitationSchema",
    });
    const test = getInvitationSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, roleId } = test.data;

    const invitation = await db.invitation.create({
      data: {
        email,
        companyRoleId: roleId,
        company: {
          connect: {
            id: company.id,
          },
        },
      },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
