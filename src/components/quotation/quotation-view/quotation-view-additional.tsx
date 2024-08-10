import { useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        rfqItem: true;
      };
    };
  };
}>;

type QuotationViewAdditionalProps = {
  quotation: QuotationType;
};

const QuotationViewAdditional = ({
  quotation: { description },
}: QuotationViewAdditionalProps) => {
  const t = useTranslations("Quotation");

  return (
    <div className="mt-4 p-2 space-y-2">
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {t("description")}
      </h4>
      <p>{description ? description : t("noDescription")}</p>
    </div>
  );
};

export default QuotationViewAdditional;
