import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import QuotationBase from "@/components/quotation/quotation-base";
import QuotationForm from "@/components/quotation/quotation-form";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";

type Props = {
  params: { locale: string; rfqId: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("newQuotationTitle"),
    description: t("newQuotationDescription"),
  };
};

const NewQuotation = async ({ params: { rfqId } }: Props) => {
  const rfq = await getRFQ(rfqId);
  if (!rfq) return notFound();

  const company = await getCurrentCompany();

  const companyOwnsRFQ = rfq.companyId === company?.id;
  const companyIsParticipant =
    rfq.participants.find((e) => e.companyId === company?.id) !== undefined;

  if (!companyOwnsRFQ && !companyIsParticipant) {
    redirect(`/supplier-guide/${rfq.id}`);
  }

  const t = await getTranslations("QuotationForm");

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="space-y-2 mb-8">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("newTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      {companyOwnsRFQ ? (
        <p>Its yours RFQ!</p>
      ) : (
        <>
          <QuotationBase rfq={rfq} />
          <RFQMainInfo rfq={rfq} />
          <QuotationForm rfq={rfq} />
        </>
      )}
    </MaxWidthWrapper>
  );
};

export default NewQuotation;
