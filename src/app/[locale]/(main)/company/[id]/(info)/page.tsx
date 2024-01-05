import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { Pencil } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import getAllowedCompany from "@/app/actions/get-allowed-company";

type CompanyType = Prisma.CompanyGetPayload<{
  include: { users: true };
}>;

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getCompany(id);
  if (!company)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: `${company.name} | ${t("projectName")}`,
    description: company.description,
  };
};

const getCompany = async (id: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<CompanyType>(`/api/company/${id}`, {
      headers: {
        "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
        Cookie: cookie,
      },
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
};

const Company = async ({ params: { id } }: Props) => {
  const t = await getTranslations("Company");

  const allowedCompany = await getAllowedCompany(id);

  const company = await getCompany(id);
  if (!company) return notFound();

  const isMember = allowedCompany !== null;

  return (
    <MaxWidthWrapper className="mb-8 space-y-4">
      {isMember && (
        <Link
          href={`/company/${company.id}/edit`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          <Pencil />
          <span>{t("edit")}</span>
        </Link>
      )}
    </MaxWidthWrapper>
  );
};

export default Company;
