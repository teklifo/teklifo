import { useTranslations } from "next-intl";
import type {
  Prisma,
  Company as CompanyType,
  RequestForQuotation as RequestForQuotationType,
} from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import {
  Calendar,
  Banknote,
  ArrowLeftCircle,
  ArrowRightCircle,
  CircleDollarSign,
  ExternalLinkIcon,
} from "lucide-react";
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import CompanyHoverCard from "@/components/company/company-hover-card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/lib/utils";

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

export const CompanyInfo = ({
  company,
  title,
}: {
  company: CompanyType;
  title: string;
}) => {
  const t = useTranslations("Quotation");

  return (
    <div className="flex flex-row items-center justify-between space-x-2">
      <MainInfoItem
        icon={<ArrowLeftCircle />}
        title={title}
        content={<CompanyHoverCard company={company} />}
      />
      <Avatar>
        <AvatarFallback>{getAvatarFallback(company.name)}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export const QuotationAttributes = ({
  quotation: {
    rfq: { startDate, endDate },
    currency,
  },
}: {
  quotation: QuotationType;
}) => {
  const t = useTranslations("Quotation");

  const daysLeft = differenceInDays(endDate, new Date());

  return (
    <>
      <div>
        <MainInfoItem
          icon={<Calendar />}
          title={t("requestDate")}
          content={`${format(startDate, "dd.MM.yyyy")} - ${format(
            endDate,
            "dd.MM.yyyy"
          )}`}
        />
        {daysLeft > 0 ? (
          <Badge>{t("daysLeft", { daysLeft })}</Badge>
        ) : (
          <Badge variant="destructive">{t("outdated")}</Badge>
        )}
      </div>
      <Separator />
      <MainInfoItem
        icon={<Banknote />}
        title={t("currency")}
        content={currency}
      />
    </>
  );
};

export const QuotationTotal = ({
  quotation: { totalAmount, currency },
}: {
  quotation: QuotationType;
}) => {
  const t = useTranslations("Quotation");

  return (
    <MainInfoItem
      icon={<CircleDollarSign />}
      title={t("totalAmount")}
      content={`${Number(totalAmount).toFixed(2)} ${currency}`}
    />
  );
};

const QuotationMainInfo = ({ quotation }: { quotation: QuotationType }) => {
  const t = useTranslations("Quotation");

  const { company: quotationCompany, rfq } = quotation;
  const { company: requestCompany } = rfq;

  return (
    <div className="space-y-4 border bg-card shadow-sm h-full rounded-xl p-4 md:p-6">
      <QuotationBase rfq={rfq} />
      <Separator />
      <CompanyInfo company={requestCompany} title={t("requestCompany")} />
      <Separator />
      <CompanyInfo company={quotationCompany} title={t("quotationCompany")} />
      <Separator />
      <QuotationAttributes quotation={quotation} />
      <Separator />
      <QuotationTotal quotation={quotation} />
    </div>
  );
};

export default QuotationMainInfo;
