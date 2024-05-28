import { useTranslations } from "next-intl";
import type {
  Prisma,
  RequestForQuotation as RequestForQuotationType,
} from "@prisma/client";
import { format } from "date-fns";
import {
  Building2,
  Briefcase,
  Banknote,
  CircleDollarSign,
  ExternalLinkIcon,
} from "lucide-react";
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import { RFQDateInfo } from "@/components/rfq/rfq-main-info";
import CompanyInfo from "@/components/company/company-info";
import { Separator } from "@/components/ui/separator";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export const QuotationBase = ({ rfq }: { rfq: RequestForQuotationType }) => {
  const t = useTranslations("Quotation");

  return (
    <h4 className="text-lg font-semibold">
      {t.rich("quotationBase", {
        number: rfq.number,
        date: format(rfq.createdAt, "dd.MM.yyyy"),
        link: (chunk) => (
          <Link
            href={`/rfq/${rfq.id}`}
            target="_blank"
            className="underline underline-offset-4"
          >
            {chunk}
            <ExternalLinkIcon className="ml-2 inline w-4 h-4" />
          </Link>
        ),
      })}
    </h4>
  );
};

export const QuotationTotal = ({
  quotation: { totalAmount, currency },
  view,
}: {
  quotation: QuotationType;
  view: "horizontal" | "vertical";
}) => {
  const t = useTranslations("Quotation");

  return (
    <MainInfoItem
      icon={<CircleDollarSign />}
      title={t("totalAmount")}
      content={`${Number(totalAmount).toFixed(2)} ${currency}`}
      view={view}
    />
  );
};

const QuotationMainInfo = ({ quotation }: { quotation: QuotationType }) => {
  const t = useTranslations("Quotation");

  const { company: quotationCompany, rfq } = quotation;
  const { company: requestCompany } = rfq;

  return (
    <div className="space-y-4 border bg-card shadow-sm rounded-xl p-4 md:p-6">
      <QuotationBase rfq={rfq} />
      <Separator />
      <CompanyInfo
        icon={<Building2 />}
        company={requestCompany}
        title={t("requestCompany")}
        view="vertical"
      />
      <Separator />
      <CompanyInfo
        icon={<Briefcase />}
        company={quotationCompany}
        title={t("quotationCompany")}
        view="vertical"
      />
      <Separator />
      <RFQDateInfo rfq={quotation.rfq} view="vertical" />
      <Separator />
      <MainInfoItem
        icon={<Banknote />}
        title={t("currency")}
        content={quotation.currency}
        view="vertical"
      />
      <Separator />
      <QuotationTotal quotation={quotation} view="vertical" />
    </div>
  );
};

export default QuotationMainInfo;
