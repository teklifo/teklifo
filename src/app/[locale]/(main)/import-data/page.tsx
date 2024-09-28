import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ExchangeJob as ExchangeJobType } from "@prisma/client";
import ImportDataForm from "./_components/import-data-form";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PaginationBar from "@/components/ui/pagination-bar";
import { Separator } from "@/components/ui/separator";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: ExchangeJobType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("importDataTitle"),
    description: t("importDataDescription"),
  };
};

const getCompanyExchangeJobs = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/exchange-jobs/?page=${page}&limit=10`,
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

const ImportData = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyExchangeJobs(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("ImportData");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2 mb-4">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      {isAdmin && <ImportDataForm />}
      {result.length > 0 ? (
        <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2">
          {result.map((exchangeJob) => (
            <div key={exchangeJob.id} className="">
              {exchangeJob.name}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t("noExchangeJobs")}
          </h2>
          <span className="leading-7 tracking-tight max-w-sm text-muted-foreground">
            {t("noExchangeJobsHint")}
          </span>
        </div>
      )}
      <PaginationBar href={`/price-types?page=`} pagination={pagination} />
      <div />
    </MaxWidthWrapper>
  );
};

export default ImportData;
