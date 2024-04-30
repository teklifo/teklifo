import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  getUserCompany,
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRoleSchema } from "@/lib/schemas";
import { FlattenAvailableDataType } from "@/types";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string; roleId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, roleId } }: Props
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

    // Check that no user is using this role
    const role = await db.companyRole.findUnique({
      where: {
        id: roleId,
      },
      include: {
        users: true,
      },
    });
    if (!role) {
      return getErrorResponse(t("invalidRoleId"), 404);
    }
    if (role.default) {
      return getErrorResponse(t("defaultRoleCantBeChanged"), 400);
    }
    if (role.users.length > 0) {
      return getErrorResponse(t("roleIsBeingUsed"), 400);
    }

    // Delete a role
    await db.companyRole.delete({
      where: {
        id: roleId,
      },
    });

    return NextResponse.json({ message: t("roleDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, roleId } }: Props
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

    // Update a role
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.roleSchema",
    });
    const test = getRoleSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { name, availableData } = test.data;

    const flattenData: FlattenAvailableDataType[] = [];
    availableData.forEach((s) =>
      s.priceTypes.forEach((p) => {
        flattenData.push({ stockId: s.stockId, priceTypeId: p.priceTypeId });
      })
    );

    const role = await db.companyRole.update({
      where: {
        id: roleId,
      },
      data: {
        name,
        availableData: {
          deleteMany: {
            companyRoleId: roleId,
          },
          createMany: {
            data: flattenData,
          },
        },
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(
  request: NextRequest,
  { params: { id, roleId } }: Props
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

    const role = await db.companyRole.findUnique({
      where: { id: roleId, companyId: id },
      include: { availableData: true, company: true },
    });

    // Role not found
    if (!role) {
      return getErrorResponse(t("invalidRoleId"), 404);
    }

    return NextResponse.json(role);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
