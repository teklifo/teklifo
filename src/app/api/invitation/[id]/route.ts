import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import getCurrentUser from "@/app/actions/get-current-user";
import getLocale from "@/lib/get-locale";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

  try {
    // Find user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAuthorized") }],
        },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          errors: [{ message: t("noEmail") }],
        },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { id, email: user.email },
      include: {
        company: true,
      },
    });
    if (!invitation) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidInvitationId") }],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(invitation);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params: { id } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

  try {
    // Find user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAuthorized") }],
        },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          errors: [{ message: t("noEmail") }],
        },
        { status: 400 }
      );
    }

    // Find invitation
    const invitation = await db.invitation.findUnique({
      where: { id, email: user.email },
    });
    if (!invitation) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidInvitationId") }],
        },
        { status: 404 }
      );
    }

    // Find company
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
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 400 }
      );
    }

    // Find role
    const role = await db.companyRole.findUnique({
      where: { id: invitation.companyRoleId, companyId: company.id },
    });
    if (!role) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRoleId") }],
        },
        { status: 400 }
      );
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
