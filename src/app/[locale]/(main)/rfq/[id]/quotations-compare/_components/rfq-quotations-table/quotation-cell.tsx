import { useMemo } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { format, differenceInDays } from "date-fns";
import { Prisma } from "@prisma/client";
import RatingBadge from "../rating-badge";
import PricePercentageBadge from "../price-percentage-badge";
import DeliveryDateBadge from "../delivery-date-badge";
import QuantityBadge from "../quantity-badge";
import QuotationModal from "@/components/quotation/quotation-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuotationsByRFQItemType } from "@/types";

type QuotationItemType = Prisma.QuotationItemGetPayload<{
  include: {
    quotation: {
      select: {
        id: true;
        totalAmount: true;
        currency: true;
        rfq: {
          select: {
            latestVersion: true;
          };
        };
        company: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

type QuotationCellProps = {
  row: QuotationsByRFQItemType;
  quotationId: number;
  position: number;
};

function calculatePricePercentage(rfqPrice: number, price: number) {
  return 100 - (rfqPrice !== 0 ? (price * 100) / rfqPrice : 100);
}

function getQuotationRow(
  quotationId: number,
  quotationItems: QuotationItemType[]
) {
  const quotationIndex = quotationItems.findIndex(
    (item) => item.quotation.id === quotationId
  );

  return quotationItems[quotationIndex];
}

const QuotationCell = ({ row, quotationId, position }: QuotationCellProps) => {
  const t = useTranslations("QuotationsCompare");
  const intlFormat = useFormatter();

  const {
    quotationItems,
    price: rfqPrice,
    quantity: rfqQuantity,
    deliveryDate: rfqDeliveryDate,
  } = row;

  const quotationRow = useMemo(
    () => getQuotationRow(quotationId, quotationItems),
    [quotationId, quotationItems]
  );

  if (!quotationRow) return "-";

  const {
    quotation,
    quantity,
    price,
    vatAmount,
    vatRate,
    vatIncluded,
    amountWithVat,
    deliveryDate,
    skip,
  } = quotationRow;

  const pricePercentage = calculatePricePercentage(
    Number(rfqPrice),
    Number(price)
  );

  const quantityDifference = Number(quantity) - Number(rfqQuantity);

  const vatRateLabel = t(vatRate);
  const vatIncludedLabel = vatIncluded ? t("vatIncluded") : t("vatNotIncluded");
  const vatAmountLabel = intlFormat.number(Number(vatAmount), {
    style: "decimal",
    minimumFractionDigits: 2,
  });

  const daysDifference = differenceInDays(deliveryDate, rfqDeliveryDate);

  return (
    <div className="p-4 group space-y-2">
      {skip ? (
        <p className="text-start text-sm text-muted-foreground">
          {t("noQuotation")}
        </p>
      ) : (
        <>
          <div className="flex flex-row items-center space-x-2">
            <p className="leading-7 font-semibold">
              {`${t("amountWithVat")}: ${intlFormat.number(
                Number(amountWithVat),
                {
                  style: "decimal",
                  minimumFractionDigits: 2,
                }
              )}`}
            </p>
            <RatingBadge position={position} />
          </div>
          <div className="flex flex-row items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              {`${t("price")}: ${intlFormat.number(Number(price), {
                style: "decimal",
                minimumFractionDigits: 3,
              })}`}
            </p>
            <PricePercentageBadge percentage={pricePercentage} />
          </div>
          <div className="flex flex-row items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              {Number(vatAmount) > 0
                ? `${vatRateLabel}, ${vatIncludedLabel}, ${vatAmountLabel}`
                : vatRateLabel}
            </p>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              {`${t("quantity")}: ${intlFormat.number(Number(quantity), {
                style: "decimal",
                minimumFractionDigits: 3,
              })}`}
            </p>
            <QuantityBadge quantityDifference={quantityDifference} />
          </div>
          <div className="flex flex-row items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              {`${t("deliveryDate")}: ${format(deliveryDate, "dd.MM.yyyy")}`}
            </p>
            <DeliveryDateBadge daysDifference={daysDifference} />
          </div>
        </>
      )}

      <QuotationModal quotation={quotation}>
        <div
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-2 w-full md:invisible group-hover:visible"
          )}
        >
          {t("more")}
        </div>
      </QuotationModal>
    </div>
  );
};

export default QuotationCell;
