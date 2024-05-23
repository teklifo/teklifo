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
  Fingerprint,
  CalendarClock,
  ArrowLeftCircle,
  ArrowRightCircle,
  CircleDollarSign,
  ExternalLinkIcon,
} from "lucide-react";
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    <h4 className="text-lg font-semibold text-center md:text-start">
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

export const RequestCompany = ({
  requestCompany: { name, id, tin },
}: {
  requestCompany: CompanyType;
}) => {
  const t = useTranslations("Quotation");

  return (
    <>
      <MainInfoItem
        icon={<ArrowLeftCircle />}
        title={t("requestCompany")}
        content={
          <Link
            href={`/company/${id}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {name}
          </Link>
        }
      />
      <MainInfoItem
        icon={<Fingerprint />}
        title={t("requestTin")}
        content={tin}
      />
    </>
  );
};

export const QuotationCompany = ({
  quotationCompany: { name, id, tin },
}: {
  quotationCompany: CompanyType;
}) => {
  const t = useTranslations("Quotation");

  return (
    <>
      <MainInfoItem
        icon={<ArrowRightCircle />}
        title={t("quotationCompany")}
        content={
          <Link
            href={`/company/${id}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {name}
          </Link>
        }
      />
      <MainInfoItem
        icon={<Fingerprint />}
        title={t("quotationTin")}
        content={tin}
      />
    </>
  );
};

export const QuotationAttributes = ({
  quotation: {
    rfq: { startDate, endDate },
    currency,
    updatedAt,
  },
}: {
  quotation: QuotationType;
}) => {
  const t = useTranslations("Quotation");

  return (
    <>
      <div className="flex flex-col items-center space-x-2 md:flex-row">
        <MainInfoItem
          icon={<Calendar />}
          title={t("requestDate")}
          content={`${format(startDate, "dd.MM.yyyy")} - ${format(
            endDate,
            "dd.MM.yyyy"
          )}`}
        />
        <Badge>
          {t("daysLeft", { daysLeft: differenceInDays(endDate, new Date()) })}
        </Badge>
      </div>
      <MainInfoItem
        icon={<CalendarClock />}
        title={t("quotationUpdatedAt")}
        content={format(updatedAt, "dd.MM.yyyy")}
      />
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
    <div className="space-y-6 border bg-card shadow-sm h-full rounded-xl p-4 md:p-6">
      <div className="space-y-4 md:space-y-2">
        <QuotationBase rfq={rfq} />
        <Separator />
      </div>
      <div className="space-y-4 md:space-y-2">
        <RequestCompany requestCompany={requestCompany} />
        <Separator />
      </div>
      <div className="space-y-4 md:space-y-2">
        <QuotationCompany quotationCompany={quotationCompany} />
        <Separator />
      </div>
      <div className="space-y-4 md:space-y-2">
        <QuotationAttributes quotation={quotation} />
        <Separator />
      </div>
      <QuotationTotal quotation={quotation} />
    </div>
  );
};

export default QuotationMainInfo;
