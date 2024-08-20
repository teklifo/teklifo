import { useFormatter, useTranslations } from "next-intl";
import type {
  Prisma,
  RequestForQuotation as RequestForQuotationType,
} from "@prisma/client";
import { CircleDollarSign, AlertCircle } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const format = useFormatter();

  return (
    <MainInfoItem
      icon={<CircleDollarSign />}
      title={t("totalAmount")}
      content={`${format.number(Number(totalAmount), {
        style: "currency",
        currency,
      })}`}
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
    </Alert>
  ) : null;
};
