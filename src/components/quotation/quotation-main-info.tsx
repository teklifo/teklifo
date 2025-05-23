import { useFormatter, useTranslations } from "next-intl";
import type {
  Prisma,
  RequestForQuotation as RequestForQuotationType,
} from "@prisma/client";
import { CircleDollarSign, AlertCircle } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { QuotationWithCompanyType } from "@/types";

export const QuotationTotal = ({
  quotation: { totalAmount, currency },
}: {
  quotation: QuotationWithCompanyType;
}) => {
  const t = useTranslations("Quotation");
  const format = useFormatter();

  return (
    <MainInfoItem
      icon={<CircleDollarSign />}
      title={t("totalAmount")}
      content={`${format.number(Number(totalAmount), {
        // style: "currency",
        style: "decimal",
        currency,
      })}`}
    />
  );
};

export const QuotationOutdated = ({
  rfq: { latestVersion },
  className,
}: {
  rfq: RequestForQuotationType;
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
