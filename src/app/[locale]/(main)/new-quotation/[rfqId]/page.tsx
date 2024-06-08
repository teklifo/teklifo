import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import QuotationForm from "@/components/quotation/quotation-form";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";

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
  const company = await getCurrentCompany();

  const rfq = await getRFQ(rfqId);
  if (!rfq) {
    const rfqPreview = await getRFQPreview(rfqId);
    if (rfqPreview) {
      redirect(`/supplier-guide/${rfqPreview.id}`);
    }

    return notFound();
  }

  const isAdmin =
    company !== null ? company.users[0].companyRole.default : false;

  const companyIsRequester = rfq.companyId === company?.id;

  const t = await getTranslations("QuotationForm");

  if (!isAdmin) {
    // No permisson
  }

  if (companyIsRequester) {
    // Can' send quotation to yourself
  }

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("newTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      {companyIsRequester || !isAdmin ? (
        !isAdmin ? (
          <p>You are not admin</p>
        ) : (
          <p>Its yours RFQ!</p>
        )
      ) : (
        <>
          <RFQMainInfo rfq={rfq} />
          <QuotationForm rfq={rfq} />
        </>
      )}
    </MaxWidthWrapper>
  );
};

export default NewQuotation;
