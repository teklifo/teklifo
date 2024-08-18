import { useFormatter, useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import QuantityBadge from "../quantity-badge";
import PricePercentageBadge from "../price-percentage-badge";
import QuotationModal from "@/components/quotation/quotation-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuotationsByRFQItemType } from "@/types";
import RatingBadge from "../rating-badge";

type QuotationItemType = Prisma.QuotationItemGetPayload<{
  include: {
    quotation: {
      select: {
        id: true;
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
};

function calculatePricePercentage(rfqPrice: number, price: number) {
  return 100 - (rfqPrice !== 0 ? (price * 100) / rfqPrice : 100);
}

function getQuotationRow(
  quotationId: number,
  quotationItems: QuotationItemType[]
) {
  const sortedQuotations = quotationItems.sort((a, b) => {
    if (a.amountWithVat > b.amountWithVat) return 1;
    if (a.amountWithVat < b.amountWithVat) return -1;
    return 0;
  });

  const quotationIndex = sortedQuotations.findIndex(
    (item) => item.quotation.id === quotationId
  );

  return { quotationRow: sortedQuotations[quotationIndex], quotationIndex };
}

const QuotationCell = ({ row, quotationId }: QuotationCellProps) => {
  const t = useTranslations("QuotationsCompare");
  const format = useFormatter();

  const { quotationItems, price: rfqPrice, quantity: rfqQuantity } = row;

  const { quotationRow, quotationIndex } = getQuotationRow(
    quotationId,
    quotationItems
  );

  if (!quotationRow) return "-";

  const { quotation, quantity, price, amountWithVat } = quotationRow;

  const pricePercentage = calculatePricePercentage(
    Number(rfqPrice),
    Number(price)
  );

  const quantityDifference = Number(quantity) - Number(rfqQuantity);

  return (
    <div className="p-4 group space-y-2">
      <div className="flex flex-row items-center space-x-2">
        <p className="leading-7 font-semibold">
          {`${t("amountWithVat")}: ${format.number(Number(amountWithVat), {
            style: "decimal",
            minimumFractionDigits: 2,
          })}`}
        </p>
        <RatingBadge position={quotationIndex} />
      </div>
      <div className="flex flex-row items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          {`${t("price")}: ${format.number(Number(price), {
            style: "decimal",
            minimumFractionDigits: 3,
          })}`}
        </p>
        <PricePercentageBadge percentage={pricePercentage} />
      </div>
      <div className="flex flex-row items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          {`${t("quantity")}: ${format.number(Number(quantity), {
            style: "decimal",
            minimumFractionDigits: 3,
          })}`}
        </p>
        <QuantityBadge quantityDifference={quantityDifference} />
      </div>
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
