import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getInvitationSchema } from "@/lib/schemas";
import getCurrentUser from "@/app/actions/get-current-user";
import getLocale from "@/lib/get-locale";

type Props = {
  params: { id: string };
};

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

    // Find company
    const company = await db.company.findUnique({
      where: { id },
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
        { status: 404 }
      );
    }

    // Check that user is an admin member of a company
    const member = company.users.find((e) => e.userId == user.id);
    if (!member?.companyRole.default) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
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
