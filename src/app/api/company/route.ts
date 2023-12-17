import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { getCompanySchema } from "@/lib/schemas";
import getCurrentUser from "@/app/actions/get-current-user";
import getPaginationData from "@/lib/pagination";
import getLocale from "@/lib/getLocale";

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.companySchema",
    });
    const test = getCompanySchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
    }

    const { id, name, tin, description, descriptionRu, slogan, sloganRu } =
      test.data;

    // Create a new company.
    const newCompany = await db.company.create({
      data: {
        id,
        name,
        tin,
        description,
        imageId: "",
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const locale = getLocale(request.headers);
  const t = await getTranslations({ locale, namespace: "API" });

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
      return NextResponse.json({
        errors: [{ message: t("pageAndlimitAreRequired") }],
      });

    // Filters
    const filters: Prisma.CompanyWhereInput = {};
    if (request.nextUrl.searchParams.get("userId"))
      filters.users = {
        some: {
          userId: request.nextUrl.searchParams.get("userId") ?? "",
        },
      };

    const [total, result] = await db.$transaction([
      db.company.count(),
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
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
