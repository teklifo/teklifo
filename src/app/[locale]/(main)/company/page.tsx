import { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Company as CompanyType } from "@prisma/client";
import CompanyCard from "@/app/[locale]/(main)/_components/company-card";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PaginationBar from "@/components/ui/pagination-bar";
import request from "@/lib/request";
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
    title: t("companiesTitle"),
    description: t("companiesDescription"),
  };
};

const getCompanies = async (page: number) => {
  try {
    const cookieStore = cookies();

    return await request<PaginatedData>(`/api/company?page=${page}&limit=10`, {
      headers: { "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value },
      next: { revalidate: 0 },
    });
  } catch (error) {
    throw error;
  }
};

const Companies = async ({
  params: { locale },
  searchParams: { page },
}: Props) => {
  const data = await getCompanies(page ?? 1);

  const { result, pagination } = data;

  const t = await getTranslations({ locale, namespace: "Companies" });

  return (
    <MaxWidthWrapper className="my-8 space-y-4">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
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

export default Companies;
