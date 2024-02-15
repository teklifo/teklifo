import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import db from "@/lib/db";
import { getMemberSchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string; memberId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, memberId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

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
    const admin = await db.companyMembers.findFirst({
      where: {
        NOT: {
          userId: memberId,
        },
        companyRole: {
          default: true,
        },
      },
    });

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

    // Check that this member is not the last admin of that company
    if (!role.default) {
      const admin = await db.companyMembers.findFirst({
        where: {
          NOT: {
            userId: memberId,
          },
          companyRole: {
            default: true,
          },
        },
      });

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
