import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import bcrypt from "bcrypt";
import getCurrentUser from "@/app/actions/get-current-user";
import db from "@/lib/db";
import { getUserSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

export async function DELETE(request: NextRequest) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return getErrorResponse(t("notAuthorized"), 401);
    }

    // Find user
    const user = await db.user.findUnique({
      where: {
        id: currentUser.id,
      },
      include: {
        companies: {
          where: {
            userId: currentUser.id,
            companyRole: {
              default: true,
            },
          },
          include: {
            company: {
              include: {
                users: {
                  where: {
                    companyRole: {
                      default: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.id !== currentUser.id) {
      return getErrorResponse(t("notAuthorized"), 401);
    }

    // Check that there is no company depending on that user
    const dependingCompanies = user?.companies.filter((company) => {
      return company.company.users.length === 1;
    });
    if (dependingCompanies) {
      const companyName = dependingCompanies
        .map((c) => c.company.name)
        .join(", ");

      return getErrorResponse(
        t("dependingCompanies", {
          username: user.name || user.email,
          companyName,
        }),
        400
      );
    }

    // Delete a user
    await db.user.delete({
      where: {
        id: user.id,
      },
    });

    return NextResponse.json({
      message: t("userDeleted", { userName: user.name }),
    });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(request: NextRequest) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find user
    const user = await getCurrentUser();
    if (!user) {
      return getErrorResponse(t("notAuthorized"), 401);
    }

    // Update a user
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.userSchema",
    });
    const test = getUserSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const { name, password } = test.data;

    let hashedPassword = undefined;
    if (password) {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
