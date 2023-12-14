import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Company as CompanyType } from "@prisma/client";
import { Plus } from "lucide-react";
import getCurrentUser from "@/app/actions/get-current-user";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import CompanyCard from "@/components/company-card";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: CompanyType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("myCompaniesTitle"),
    description: t("myCompaniesDescription"),
  };
};

const getUserCompanies = async (page: number) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("No user");

    const cookieStore = cookies();

    return await request<PaginatedData>(
      `/api/company?userId=${user.id}&page=${page}&limit=10`,
      {
        headers: { "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value },
        cache: "no-cache",
      }
    );
  } catch (error) {
    throw error;
  }
};

const MyCompanies = async ({ searchParams: { page } }: Props) => {
  const data = await getUserCompanies(page ?? 1);
  return <UserCompaniesContent data={data} />;
};

const UserCompaniesContent = ({
  data: { result, pagination },
}: {
  data: PaginatedData;
}) => {
  const t = useTranslations("MyCompanies");

  return (
    <MaxWidthWrapper className="mt-8 space-y-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <Link
        href="/new-company"
        className={cn("space-x-2", buttonVariants({ variant: "default" }))}
      >
        <Plus />
        <span>{t("newCompany")}</span>
      </Link>
      <div>
        <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
        <div className="w-full flex flex-row justify-center items-center py-10">
          {/* <Pagination href="/companies?page=" pagination={pagination} /> */}
        </div>
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default MyCompanies;
