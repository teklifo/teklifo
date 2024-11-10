import { Quotation as QuotationType } from "@prisma/client";

type QuotationRowProps = {
  quotation: QuotationType;
};

const QuotationRow = ({ quotation }: QuotationRowProps) => {
  return <div>QuotationRow</div>;
};

export default QuotationRow;
