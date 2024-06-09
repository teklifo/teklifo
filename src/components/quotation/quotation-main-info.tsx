import { useLocale, useTranslations } from "next-intl";
import type {
  Prisma,
  RequestForQuotation as RequestForQuotationType,
} from "@prisma/client";
import {
  Building2,
  Briefcase,
  Banknote,
  CircleDollarSign,
  ExternalLinkIcon,
  AlertCircle,
} from "lucide-react";
import { ClassValue } from "clsx";
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import { RFQDateInfo } from "@/components/rfq/rfq-main-info";
import CompanyInfo from "@/components/company/company-info";
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

export const QuotationBase = ({
  rfq: { number, id, title },
}: {
  rfq: RequestForQuotationType;
}) => {
  const t = useTranslations("Quotation");

  return (
    <p className="text-lg text-muted-foreground">
      {t.rich("quotationBase", {
        number,
        title,
        link: (chunk) => (
          <Link
            href={`/rfq/${id}`}
            target="_blank"
            className="underline underline-offset-4"
          >
            {chunk}
            <ExternalLinkIcon className="ml-2 inline w-4 h-4" />
          </Link>
        ),
      })}
    </p>
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

export const QuotationOutdated = ({
  rfq: { companyId, latestVersion, endDate },
  currentCompanyId,
  className,
}: {
  rfq: RequestForQuotationType;
  currentCompanyId?: string;
  className: ClassValue;
}) => {
  const t = useTranslations("Quotation");

  const outdated = !latestVersion && new Date(endDate) < new Date();

  return outdated ? (
    <Alert variant="destructive" className={cn("max-w-md", className)}>
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
      <QuotationTotal quotation={quotation} view="vertical" />
      <Separator />
      <p className="text-sm text-muted-foreground">
        {`${t("updatedAt")}: ${localizedRelativeDate(
          updatedAt,
          new Date(),
          locale
        )}`}
      </p>
    </div>
  );
};

export default QuotationMainInfo;
