import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getTopQuotationItemsPerRFQ } from "@prisma/client/sql";
import { ArrowRightCircle } from "lucide-react";
import RFQQuotationOrder from "./_components/rfq-quotations-order";
import RFQQuotationsTable from "./_components/rfq-quotations-table";
import BackButton from "@/components/back-button";
import PaginationBar from "@/components/ui/pagination-bar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";
import request from "@/lib/request";
import { QuotationsByRFQItemType, PaginationType } from "@/types";

type SearchParams = {
  order?: string;
  page?: number;
};

type Props = {
  params: { locale: string; id: string };
  searchParams: SearchParams;
};

type PaginatedData = {
  result: QuotationsByRFQItemType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { id, locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const rfq = await getRFQ(id);
  if (!rfq)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("quotationsCompareTitle", { title: rfq.title }),
    description: t("quotationsCompareDescription"),
  };
};

const getRFQQuotations = async (rfqId: string, searchParams: SearchParams) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    const { order, page } = searchParams;

    return await request<PaginatedData>(
      `/api/rfq/${rfqId}/quotations?order=${order ?? "amountAsc"}&page=${
        page ?? 1
      }&limit=10`,
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

const getTopQuotationItems = async (rfqId: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<getTopQuotationItemsPerRFQ.Result[]>(
      `/api/rfq/${rfqId}/quotations/top`,
      {
        headers: {
          "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
          Cookie: cookie,
        },
        next: { revalidate: 0 },
      }
    );
  } catch (error) {
    return [];
  }
};

const QuotationsCompare = async ({ params: { id }, searchParams }: Props) => {
  const rfq = await getRFQ(id);

  if (!rfq) {
    const rfqPreview = await getRFQPreview(id);
    if (rfqPreview) {
      redirect(`/supplier-guide/${rfqPreview.id}`);
    }
    return notFound();
  }

  const company = await getCurrentCompany();
  if (!company) return notFound();

  if (rfq.companyId !== company.id) {
    return notFound();
  }

  const data = await getRFQQuotations(id, searchParams);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("QuotationsCompare");

  const topQuotations = await getTopQuotationItems(id);

  return (
    <div className="mt-4 mx-2 space-y-8 md:mx-8">
      <div className="space-y-2">
        <div className="flex justify-start items-center space-x-4">
          <BackButton href={`/rfq/${rfq.id}`} />
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {`${t("title")}: ${rfq.title}`}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <RFQQuotationOrder id={id} defaultValue={searchParams.order} />
      {result.length > 0 ? (
        <div className="flex flex-col space-y-3">
          <ScrollArea className="w-full min-h-full">
            <RFQQuotationsTable
              rfqQuotations={result}
              topQuotations={topQuotations}
            />
            <ScrollBar orientation="horizontal" className="h-4" />
          </ScrollArea>
        </div>
      ) : (
        <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
          <ArrowRightCircle className="w-48 h-48" />
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t("noIncomingQuotation")}
          </h2>
        </div>
      )}
      <PaginationBar
        href={`/rfq/${id}/quotations-compare?page=`}
        pagination={pagination}
      />
      <div />
    </div>
  );
};

export default QuotationsCompare;
