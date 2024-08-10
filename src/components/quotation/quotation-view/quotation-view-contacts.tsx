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

type QuotationViewContactsProps = {
  quotation: QuotationType;
};

const QuotationViewContacts = ({ quotation }: QuotationViewContactsProps) => {
  const { contactPerson, email, phone } = quotation;

  const t = useTranslations("Quotation");

  return (
    <div className="mt-4 space-y-2">
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        {t("contacts")}
      </h4>
      <div className="space-y-1">
        <p className="whitespace-pre-line">{contactPerson}</p>
        <p className="whitespace-pre-line">{email}</p>
        <p className="whitespace-pre-line">{phone}</p>
      </div>
    </div>
  );
};

export default QuotationViewContacts;
