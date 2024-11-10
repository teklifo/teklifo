import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import AIAnalysisSettings from "./_components/ai-analysis-settings";
import AIAnalysisHistory from "./_components/ai-analysis-history";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";
import request from "@/lib/request";

type Props = {
  params: { locale: string; id: string };
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
    title: t("quotationsAIAnalysisTitle", { title: rfq.title }),
    description: t("quotationsAIAnalysisDescription"),
  };
};

const getAnalysisHistory = async (rfqId: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<AIQuotationsAnalysisType[]>(
      `/api/ai/rfq/${rfqId}/top-quotations`,
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

const QuotationsAIAnalysis = async ({ params: { id } }: Props) => {
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

  const analysisHistory = await getAnalysisHistory(id);

  const t = await getTranslations("QuotationsAIAnalysis");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {`${t("title")}: ${rfq.title}`}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      {
        <div className="mt-4 space-y-10">
          <AIAnalysisSettings rfqId={id} />
          <AIAnalysisHistory analysisHistory={analysisHistory} />
        </div>
      }
      <div />
    </MaxWidthWrapper>
  );
};

export default QuotationsAIAnalysis;
