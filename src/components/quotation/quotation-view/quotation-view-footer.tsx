import { useFormatter, useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    items: {
      include: {
        product: true;
        rfqItem: true;
      };
    };
  };
}>;

type QuotationViewFooterProps = {
  quotation: QuotationType;
};

const QuotationViewFooter = ({ quotation }: QuotationViewFooterProps) => {
  const t = useTranslations("Quotation");
  const format = useFormatter();

  const { items, currency, totalAmount, vatIncluded } = quotation;

  let totalVatAmount = 0;
  items.forEach((item) => (totalVatAmount = +item.vatAmount));

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-start items-center space-x-2 px-2">
        <span>{`${t("totalAmount")}:`}</span>
        <span className="font-semibold">
          {format.number(Number(totalAmount), {
            // style: "currency",
            style: "decimal",
            currency: currency,
          })}
        </span>
      </div>
      <div className="flex flex-row justify-start items-center space-x-2 px-2">
        <span>{`${vatIncluded ? t("totalVatIncluded") : t("totalVat")}:`}</span>
        <span className="font-semibold">
          {format.number(totalVatAmount, {
            // style: "currency",
            style: "decimal",
            currency: currency,
          })}
        </span>
      </div>
    </div>
  );
};

export default QuotationViewFooter;
