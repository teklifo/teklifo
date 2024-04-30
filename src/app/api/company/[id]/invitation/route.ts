import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getInvitationSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params: { id } }: Props) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getUserCompany(id);
    const isAdmin = await isCompanyAdmin(id);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    } else if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Create a new invitation
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.invitationSchema",
    });
    const test = getInvitationSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
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
    return getErrorResponse(t("serverError"), 500);
  }
}
