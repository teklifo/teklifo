import { cookies } from "next/headers";
import getCurrentUser from "@/app/actions/get-current-user";
import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1),
  tin: z.string().length(10),
  imageId: z.string(),
  description: z.string().min(1),
  descriptionRu: z.string(),
  slogan: z.string(),
  sloganRu: z.string(),
});

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

  const test = schema.safeParse(body);
  if (!test.success) {
    return NextResponse.json(
      {
        message: t("invalidRequest"),
        errors: test.error.issues,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ name: "hello world" });
}
