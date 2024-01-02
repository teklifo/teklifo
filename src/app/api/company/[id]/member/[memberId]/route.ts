import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getMemberSchema } from "@/lib/schemas";
import getCurrentUser from "@/app/actions/get-current-user";
import getLocale from "@/lib/get-locale";

type Props = {
  params: { id: string; memberId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, memberId } }: Props
) {
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
    const adminMember = company.users.find((e) => e.userId == user.id);
    if (!adminMember?.companyRole.default) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Find member
    const existingMember = await db.user.findUnique({
      where: {
        id: memberId,
        companies: {
          some: {
            companyId: company.id,
          },
        },
      },
    });
    if (!existingMember) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidMemberId") }],
        },
        { status: 400 }
      );
    }

    // Check that this member is not the last admin of that company
    const admin = company.users.find(
      (e) => e.companyRole.default && e.userId !== memberId
    );
    if (!admin) {
      return NextResponse.json(
        {
          errors: [
            {
              message: t("cantDeleteLastAdmin", {
                userName: existingMember.name || existingMember.email,
                companyName: company.name,
              }),
            },
          ],
        },
        { status: 404 }
      );
    }

    // Delete a member
    await db.companyMembers.delete({
      where: {
        userId_companyId: {
          userId: memberId,
          companyId: company.id,
        },
      },
    });

    return NextResponse.json({ message: t("memberDeleted") });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, memberId } }: Props
) {
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
    const adminMember = company.users.find((e) => e.userId == user.id);
    if (!adminMember?.companyRole.default) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Check body
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.memberSchema",
    });
    const test = getMemberSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
    }

    const { roleId } = test.data;

    // Find member
    const existingMember = await db.user.findUnique({
      where: {
        id: memberId,
        companies: {
          some: {
            companyId: company.id,
          },
        },
      },
    });
    if (!existingMember) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidMemberId") }],
        },
        { status: 400 }
      );
    }

    // Find role
    const role = await db.companyRole.findUnique({
      where: { id: roleId, companyId: company.id },
    });
    if (!role) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRoleId") }],
        },
        { status: 400 }
      );
    }

    // Update a member
    const member = await db.companyMembers.update({
      where: {
        userId_companyId: {
          userId: memberId,
          companyId: company.id,
        },
      },
      data: {
        companyId: company.id,
        userId: memberId,
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
