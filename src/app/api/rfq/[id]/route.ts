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
