import { Prisma } from "@prisma/client";
import QuotationModal from "@/components/quotation/quotation-modal";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
  quotationRow: { quotation, amountWithVat, quantity },
}: QuotationCellProps) => {
  const t = useTranslations("QuotationsCompare");

  return (
    <div className="p-4 group">
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        {Number(amountWithVat).toFixed(2)}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("quantity")}: ${Number(quantity).toFixed(3)}`}
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
