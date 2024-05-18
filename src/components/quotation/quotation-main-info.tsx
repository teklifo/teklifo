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
    <div className="space-y-6 bg-muted rounded-xl p-2 md:p-6">
      <div className="space-y-2">
        <div className="flex flex-row items-end space-x-2">
          <ArrowLeftCircle />
          <span>{`${t("requestCompany")}:`}</span>
          <Link
            href={`/company/${requestCompany.id}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {requestCompany.name}
          </Link>
        </div>
        <div className="flex flex-row items-end space-x-2">
          <Fingerprint />
          <span>{`${t("requestTin")}:`}</span>
          <span className="font-semibold">{requestCompany.tin}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-row items-end space-x-2">
          <ArrowRightCircle />
          <span>{`${t("quotationCompany")}:`}</span>
          <Link
            href={`/company/${quotationCompany.id}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {quotationCompany.name}
          </Link>
        </div>
        <div className="flex flex-row items-end space-x-2">
          <Fingerprint />
          <span>{`${t("quotationTin")}:`}</span>
          <span className="font-semibold">{quotationCompany.tin}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-row space-x-2">
          <Calendar />
          <span>{`${t("requestDate")}:`}</span>
          <span className="font-semibold">
            {`${format(startDate, "dd.MM.yyyy")} - ${format(
              endDate,
              "dd.MM.yyyy"
            )}`}
          </span>
        </div>
        <div className="flex flex-row space-x-2">
          <CalendarClock />
          <span>{`${t("quotationCreatedAt")}:`}</span>
          <span className="font-semibold">
            {format(quotation.createdAt, "dd.MM.yyyy")}
          </span>
        </div>
        <div className="flex flex-row space-x-2">
          <Banknote />
          <span>{`${t("currency")}:`}</span>
          <span className="font-semibold">{currency}</span>
        </div>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <CircleDollarSign />
        <span>{`${t("totalAmount")}:`}</span>
        <span className="font-semibold text-2xl">{`${Number(
          totalAmount
        ).toFixed(2)} ${currency}`}</span>
      </div>
    </div>
  );
};

export default QuotationMainInfo;
