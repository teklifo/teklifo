import { Prisma } from "@prisma/client";
import QuotationModal from "@/components/quotation/quotation-modal";
import { Button } from "@/components/ui/button";
import { useFormatter, useTranslations } from "next-intl";

export type QuotationByRFQItemType = Prisma.QuotationItemGetPayload<{
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
  quotationRow: QuotationByRFQItemType;
};

const QuotationCell = ({
  quotationRow: { quotation, quantity, price, amountWithVat },
}: QuotationCellProps) => {
  const t = useTranslations("QuotationsCompare");
  const format = useFormatter();

  return (
    <div className="p-4 group">
      <p className="leading-7 font-semibold">
        {`${t("amountWithVat")}: ${format.number(Number(amountWithVat), {
          style: "decimal",
          minimumFractionDigits: 2,
        })}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("price")}: ${format.number(Number(price), {
          style: "decimal",
          minimumFractionDigits: 3,
        })}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("quantity")}: ${format.number(Number(quantity), {
          style: "decimal",
          minimumFractionDigits: 3,
        })}`}
      </p>
      <QuotationModal quotation={quotation}>
        <Button
          variant="outline"
          className="mt-2 w-full md:invisible group-hover:visible"
        >
          {t("more")}
        </Button>
      </QuotationModal>
    </div>
  );
};

export default QuotationCell;
