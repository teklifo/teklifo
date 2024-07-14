import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import QuotationForm from "@/components/quotation/quotation-form";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
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
  const rfq = await getRFQ(rfqId);
  if (!rfq) {
    const rfqPreview = await getRFQPreview(rfqId);
    if (rfqPreview) {
      redirect(`/supplier-guide/${rfqPreview.id}`);
    }

    return notFound();
  }

  if (new Date(rfq.endDate) < new Date()) return notFound();

  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) return notFound();

  const companyIsRequester = rfq.companyId === company?.id;

  const t = await getTranslations("QuotationForm");

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("newTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      {companyIsRequester ? (
        <p>Its yours RFQ!</p>
      ) : (
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:gap-4">
          <div className="col-span-8 space-y-6 mt-4 lg:mt-0">
            <QuotationForm rfq={rfq} />
          </div>
          <div className="order-first col-span-4 space-y-6 lg:order-none">
            <RFQMainInfo rfq={rfq} displayRfqLink={true} />
          </div>
        </div>
      )}
    </MaxWidthWrapper>
  );
};

export default NewQuotation;
