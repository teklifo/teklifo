import { useLocale, useTranslations } from "next-intl";
import type {
  Prisma,
  RequestForQuotation as RequestForQuotationType,
} from "@prisma/client";
import {
  Building2,
  Briefcase,
  CircleDollarSign,
  AlertCircle,
  FileInput,
} from "lucide-react";
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import { RFQDateInfo } from "@/components/rfq/rfq-main-info";
import CompanyInfo from "@/components/company/company-info";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn, localizedRelativeDate } from "@/lib/utils";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
  };
}>;

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

export const QuotationOutdated = ({
  rfq: { companyId, latestVersion },
  currentCompanyId,
  className,
}: {
  rfq: RequestForQuotationType;
  currentCompanyId?: string;
  className: string;
}) => {
  const t = useTranslations("Quotation");

  return !latestVersion ? (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{t("outdated")}</AlertTitle>
      <AlertDescription>
        {currentCompanyId === companyId
          ? t("outdatedHintRequest")
          : t("outdatedHintQuotation")}
      </AlertDescription>
    </Alert>
  ) : null;
};

const QuotationMainInfo = ({ quotation }: { quotation: QuotationType }) => {
  const t = useTranslations("Quotation");

  const locale = useLocale();

  const { company: quotationCompany, rfq, updatedAt } = quotation;
  const { company: requestCompany } = rfq;

  return (
    <div className="space-y-4 border bg-card shadow-sm rounded-xl p-4 md:p-6">
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
      <RFQDateInfo endDate={quotation.rfq.endDate} view="vertical" />
      <Separator />
      <QuotationTotal quotation={quotation} view="vertical" />
      <Separator />
      <p className="text-sm text-muted-foreground">
        {`${t("updatedAt")}: ${localizedRelativeDate(
          new Date(updatedAt),
          new Date(),
          locale
        )}`}
      </p>
      <Link
        href={`/rfq/${rfq.id}`}
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "text-center whitespace-normal h-auto space-x-2 lg:w-full"
        )}
      >
        <FileInput />
        <span>{t("viewRfq")}</span>
      </Link>
    </div>
  );
};

export default QuotationMainInfo;
