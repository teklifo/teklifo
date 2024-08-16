import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRightCircle } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQQuotationsTable from "./_components/rfq-quotations-table";
import PaginationBar from "@/components/ui/pagination-bar";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";
import request from "@/lib/request";
import { QuotationsByRFQItemType, PaginationType } from "@/types";

type Props = {
  params: { locale: string; id: string };
  searchParams: {
    page?: number;
  };
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

const getRFQQuotations = async (rfqId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/rfq/${rfqId}/quotations?page=${page}&limit=10`,
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

const QuotationsCompare = async ({
  params: { id },
  searchParams: { page },
}: Props) => {
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

  const data = await getRFQQuotations(id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("QuotationsCompare");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="mt-4">
        {result.length > 0 ? (
          <div className="flex flex-col space-y-3 pt-4">
            <RFQQuotationsTable rfqQuotations={result} />
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
    </MaxWidthWrapper>
  );
};

export default QuotationsCompare;
