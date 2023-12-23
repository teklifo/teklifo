import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { Pencil } from "lucide-react";
import getCurrentUser from "@/app/actions/get-current-user";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import request from "@/lib/request";
import { cn } from "@/lib/utils";

type CompanyType = Prisma.CompanyGetPayload<{
  include: { users: true };
}>;

type Props = {
  params: { locale: string; id: string };
};

type CompanyContentProps = {
  company: CompanyType;
  isMember: boolean;
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
  const company = await getCompany(id);
  if (!company) return notFound();

  const user = await getCurrentUser();
  const isMember = user
    ? (company.users?.filter((element) => element.userId === user.id) ?? [])
        .length > 0 ?? false
    : false;

  return <CompanyContent company={company} isMember={isMember} />;
};

const CompanyContent = ({ company, isMember }: CompanyContentProps) => {
  const t = useTranslations("Company");

  return (
    <MaxWidthWrapper className="mt-8 space-y-4">
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
