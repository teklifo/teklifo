import { Metadata } from "next";
import { cookies } from "next/headers";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Company as CompanyType } from "@prisma/client";
import { Building2, Plus } from "lucide-react";
import { Link } from "@/navigation";
import getCurrentUser from "@/app/actions/get-current-user";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import CompanyCard from "@/components/company/company-card";
import PaginationBar from "@/components/ui/pagination-bar";
import { buttonVariants } from "@/components/ui/button";
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
        next: { revalidate: 0 },
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
    <MaxWidthWrapper className="my-8 space-y-4">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <div className="flex flex-row items-center space-x-2">
            <div>
              <Building2 className="w-10 h-10" />
            </div>
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
              {t("title")}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          href="/new-company"
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          <Plus />
          <span>{t("newCompany")}</span>
        </Link>
      </div>
      <div>
        <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2 lg:grid-cols-3">
          {result.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
        <PaginationBar href="/my-companies?page=" pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default MyCompanies;
