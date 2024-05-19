import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar,
  Banknote,
  Fingerprint,
  CalendarClock,
  ArrowLeftCircle,
  ArrowRightCircle,
  CircleDollarSign,
} from "lucide-react";
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import { Separator } from "@/components/ui/separator";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
    products: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationMainInfoProps = {
  quotation: QuotationType;
};

const QuotationMainInfo = ({ quotation }: QuotationMainInfoProps) => {
  const t = useTranslations("Quotation");

  const {
    company: quotationCompany,
    totalAmount,
    rfq: { company: requestCompany, startDate, endDate, currency },
  } = quotation;

  return (
    <div className="space-y-6 border bg-card shadow-sm h-full rounded-xl p-4 md:p-6">
      <div className="space-y-4">
        <MainInfoItem
          icon={<ArrowLeftCircle />}
          title={t("requestCompany")}
          content={
            <Link
              href={`/company/${requestCompany.id}`}
              className="scroll-m-20 underline text-lg font-semibold tracking-tight"
            >
              {requestCompany.name}
            </Link>
          }
        />
        <MainInfoItem
          icon={<Fingerprint />}
          title={t("requestTin")}
          content={requestCompany.tin}
        />
        <Separator />
      </div>
      <div className="space-y-4">
        <MainInfoItem
          icon={<ArrowRightCircle />}
          title={t("quotationCompany")}
          content={
            <Link
              href={`/company/${quotationCompany.id}`}
              className="scroll-m-20 underline text-lg font-semibold tracking-tight"
            >
              {quotationCompany.name}
            </Link>
          }
        />
        <MainInfoItem
          icon={<Fingerprint />}
          title={t("quotationTin")}
          content={quotationCompany.tin}
        />
        <Separator />
      </div>
      <div className="space-y-4">
        <MainInfoItem
          icon={<Calendar />}
          title={t("requestDate")}
          content={`${format(startDate, "dd.MM.yyyy")} - ${format(
            endDate,
            "dd.MM.yyyy"
          )}`}
        />
        <MainInfoItem
          icon={<CalendarClock />}
          title={t("quotationCreatedAt")}
          content={format(quotation.createdAt, "dd.MM.yyyy")}
        />
        <MainInfoItem
          icon={<Banknote />}
          title={t("currency")}
          content={currency}
        />
        <Separator />
      </div>
      <MainInfoItem
        icon={<CircleDollarSign />}
        title={t("totalAmount")}
        content={`${Number(totalAmount).toFixed(2)} ${currency}`}
      />
    </div>
  );
};

export default QuotationMainInfo;
