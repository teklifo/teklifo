import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ExchangeLog as ExchangeLogType } from "@prisma/client";
import ExchangeLogsTable from "./_components/logs-table";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PaginationBar from "@/components/ui/pagination-bar";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import BackButton from "@/components/back-button";

type Props = {
  params: { locale: string; id: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: ExchangeLogType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("exchangeJobTitle"),
    description: t("exchangeJobDescription"),
  };
};

const getExchangeJobLogs = async (
  companyId: string,
  exchangeJobId: string,
  page: number
) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/exchange-jobs/${exchangeJobId}/logs?page=${page}&limit=10`,
      {
        headers: {
          "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
          Cookie: cookie,
        },
        next: { revalidate: 0 },
      }
    );
  } catch (error) {
    return undefined;
  }
};

const ImportData = async ({
  params: { id: exchangeJobId },
  searchParams: { page },
}: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) return notFound();

  const data = await getExchangeJobLogs(company.id, exchangeJobId, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("ExchangeJob");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2 mb-4">
        <div className="flex justify-start items-center space-x-4">
          <BackButton defaultHref="/import-data" />
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      {result.length > 0 ? (
        <div className="mt-8">
          <ExchangeLogsTable exchangeLogs={result} />
        </div>
      ) : (
        <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t("noLogs")}
          </h2>
          <span className="leading-7 tracking-tight max-w-sm text-muted-foreground">
            {t("noLogsHint")}
          </span>
        </div>
      )}
      <PaginationBar href={`/import-data?page=`} pagination={pagination} />
      <div />
    </MaxWidthWrapper>
  );
};

export default ImportData;
