import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getMemberSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string; memberId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, memberId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getUserCompany(id);
    const isAdmin = await isCompanyAdmin(id);
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    } else if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
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
      return getErrorResponse(t("invalidMemberId"), 400);
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
      return getErrorResponse(
        t("cantDeleteLastAdmin", {
          userName: existingMember.name || existingMember.email,
          companyName: company.name,
        }),
        400
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
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, memberId } }: Props
) {
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

    // Check body
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.memberSchema",
    });
    const test = getMemberSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
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
      return getErrorResponse(t("invalidMemberId"), 400);
    }

    // Find role
    const role = await db.companyRole.findUnique({
      where: { id: roleId, companyId: company.id },
    });
    if (!role) {
      return getErrorResponse(t("invalidRoleId"), 400);
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
        return getErrorResponse(
          t("cantDeleteLastAdmin", {
            userName: existingMember.name || existingMember.email,
            companyName: company.name,
          }),
          400
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
    return getErrorResponse(t("serverError"), 500);
  }
}
