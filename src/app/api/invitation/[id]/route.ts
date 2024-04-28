import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import getCurrentUser from "@/app/actions/get-current-user";
import { getTranslationsFromHeader } from "@/lib/utils";
import { getErrorResponse } from "../../utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find user
    const user = await getCurrentUser();
    if (!user) {
      return getErrorResponse(t("notAuthorized"), 401);
    }

    if (!user.email) {
      return getErrorResponse(t("noEmail"), 400);
    }

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { id, email: user.email },
      include: {
        company: true,
      },
    });
    if (!invitation) {
      return getErrorResponse(t("invalidInvitationId"), 404);
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function POST(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find user
    const user = await getCurrentUser();
    if (!user) {
      return getErrorResponse(t("notAuthorized"), 401);
    }

    if (!user.email) {
      return getErrorResponse(t("noEmail"), 400);
    }

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { id, email: user.email },
    });
    if (!invitation) {
      return getErrorResponse(t("invalidInvitationId"), 404);
    }

    // Check company
    const company = await db.company.findUnique({
      where: { id: invitation.companyId },
      include: {
        users: {
          include: {
            companyRole: true,
          },
        },
      },
    });
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    // Find role
    const role = await db.companyRole.findUnique({
      where: { id: invitation.companyRoleId, companyId: company.id },
    });
    if (!role) {
      return getErrorResponse(t("invalidRoleId"), 400);
    }

    // Create a new member
    const member = await db.companyMembers.upsert({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: company.id,
        },
      },
      create: {
        companyId: company.id,
        userId: user.id,
        companyRoleId: role.id,
      },
      update: {
        companyId: company.id,
        userId: user.id,
        companyRoleId: role.id,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
