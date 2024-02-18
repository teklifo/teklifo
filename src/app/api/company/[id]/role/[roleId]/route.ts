import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getUserCompany from "@/app/actions/get-user-company";
import db from "@/lib/db";
import { getRoleSchema } from "@/lib/schemas";
import { FlattenAvailableDataType } from "@/types";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string; roleId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, roleId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getUserCompany(id);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
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
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRoleId") }],
        },
        { status: 404 }
      );
    }
    if (role.default) {
      return NextResponse.json(
        {
          errors: [{ message: t("defaultRoleCantBeChanged") }],
        },
        { status: 400 }
      );
    }
    if (role.users.length > 0) {
      return NextResponse.json(
        {
          errors: [{ message: t("roleIsBeingUsed") }],
        },
        { status: 400 }
      );
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params: { id, roleId } }: Props
) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getUserCompany(id);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    // Update a role
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.roleSchema",
    });
    const test = getRoleSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params: { id, roleId } }: Props
) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getUserCompany(id);
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    const role = await db.companyRole.findUnique({
      where: { id: roleId, companyId: id },
      include: { availableData: true, company: true },
    });

    // Role not found
    if (!role) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRoleId") }],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
