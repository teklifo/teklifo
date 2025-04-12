import {
  calculateAmountWithVat,
  calculateVatAmount,
  getVatRatePercentage,
} from "@/lib/calculations";
import { useFormatter, useTranslations } from "next-intl";
import { useWatch } from "react-hook-form";

const QuotationTotalAmount = () => {
  const t = useTranslations("Quotation");
  const format = useFormatter();

  const currency = useWatch({ name: "currency" });
  const vatIncluded = useWatch({ name: "vatIncluded" });
  const items = useWatch({ name: "items" });

  let totalAmount = 0;
  let totalVatAmount = 0;

  items.forEach((item: any) => {
    if (item.skip) return;

    const { vatRatePercentage } = getVatRatePercentage(item.vatRate);

    const vatAmount = calculateVatAmount(
      item.amount,
      vatIncluded,
      vatRatePercentage
    );

    totalVatAmount = totalVatAmount + vatAmount;

    totalAmount =
      totalAmount +
      calculateAmountWithVat(
        Number(item.amount),
        Number(vatAmount),
        vatIncluded
      );
  });

  return (
    <div>
      <div className="flex flex-row justify-start items-center space-x-2 px-2 md:px-0">
        <span>{`${t("totalAmount")}:`}</span>
        <span className="font-semibold">
          {format.number(totalAmount, {
            // style: "currency",
            style: "decimal",
            currency,
          })}
        </span>
      </div>
      <div className="flex flex-row justify-start items-center space-x-2 px-2 md:px-0">
        <span>{`${vatIncluded ? t("totalVatIncluded") : t("totalVat")}:`}</span>
        <span className="font-semibold">
          {format.number(totalVatAmount, {
            // style: "currency",
            style: "decimal",
            currency,
          })}
        </span>
      </div>
    </div>
  );
};

export default QuotationTotalAmount;
