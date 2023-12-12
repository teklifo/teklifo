import { cookies } from "next/headers";
import db from "@/lib/db";
import getCurrentUser from "@/app/actions/get-current-user";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getCompanySchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "ru";

  const t = await getTranslations({ locale, namespace: "API" });

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        message: t("notAuthorized"),
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

  const { name, tin, description, descriptionRu, slogan, sloganRu } = test.data;

  // Create a new company.
  const newCompany = await db.company.create({
    data: {
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
}
