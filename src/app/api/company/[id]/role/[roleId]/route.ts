import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getRoleSchema } from "@/lib/schemas";
import getCurrentUser from "@/app/actions/get-current-user";
import getLocale from "@/lib/get-locale";
import { FlattenAvailableDataType } from "@/types";

type Props = {
  params: { id: string; roleId: string };
};

export async function DELETE(
  request: NextRequest,
  { params: { id, roleId } }: Props
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
    const member = company.users.find((e) => e.userId == user.id);
    if (!member?.companyRole.default) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
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

export async function GET(request: NextRequest, { params: { roleId } }: Props) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAuthorized") }],
        },
        { status: 401 }
      );
    }

    const role = await db.companyRole.findUnique({
      where: { id: roleId },
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
