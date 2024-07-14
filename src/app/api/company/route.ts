import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type { ZodIssue } from "zod";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { getCompanySchema } from "@/lib/schemas";
import getCurrentUser from "@/app/actions/get-current-user";
import getPaginationData from "@/lib/pagination";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    const user = await getCurrentUser();
    if (!user) {
      return getErrorResponse(t("notAuthorized"), 401);
    }

    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.companySchema",
    });
    const test = getCompanySchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

    const {
      id,
      name,
      tin,
      email,
      phone,
      website,
      description,
      descriptionRu,
      slogan,
      sloganRu,
    } = test.data;

    // Check unique attributes
    const existingCompanies = await db.company.findMany({
      where: {
        OR: [{ id }, { tin }, { name }],
      },
    });
    if (existingCompanies.length > 0) {
      const uniquenessErrors: ZodIssue[] = [];

      existingCompanies.map((existingCompany) => {
        if (existingCompany.id === id) {
          uniquenessErrors.push({
            code: "custom",
            path: ["id"],
            message: t("idIsNotUnique", { id }),
          });
        }
        if (existingCompany.name === name) {
          uniquenessErrors.push({
            code: "custom",
            path: ["name"],
            message: t("nameIsNotUnique", { name }),
          });
        }
        if (existingCompany.tin === tin) {
          uniquenessErrors.push({
            code: "custom",
            path: ["tin"],
            message: t("tinIsNotUnique", { tin }),
          });
        }
      });

      return getErrorResponse(uniquenessErrors, 400);
    }

    // Create a new company.
    const newCompany = await db.company.create({
      data: {
        id,
        name,
        tin,
        email,
        phone,
        website,
        description,
        descriptionRu,
        slogan,
        sloganRu,
      },
    });

    // Create a default role 'Full access' and give it to a creator of a company.
    const company = await db.company.update({
      where: {
        id: newCompany.id,
      },
      data: {
        users: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
            companyRole: {
              create: {
                companyId: newCompany.id,
                default: true,
                name: "Full access",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function GET(request: NextRequest) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const page = parseInt(
      request.nextUrl.searchParams.get("page") as string,
      10
    );
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") as string,
      10
    );

    const startIndex = (page - 1) * limit;

    if (!page || !limit)
      return getErrorResponse(t("pageAndlimitAreRequired"), 400);

    // Filters
    const filters: Prisma.CompanyWhereInput = {};
    if (request.nextUrl.searchParams.get("userId"))
      filters.users = {
        some: {
          userId: request.nextUrl.searchParams.get("userId") ?? "",
        },
      };

    const [total, result] = await db.$transaction([
      db.company.count({
        where: filters,
      }),
      db.company.findMany({
        take: limit,
        skip: startIndex,
        where: filters,
        orderBy: {
          name: "desc",
        },
        include: {
          users: true,
        },
      }),
    ]);

    const pagination = getPaginationData(startIndex, page, limit, total);

    return NextResponse.json({
      result,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
