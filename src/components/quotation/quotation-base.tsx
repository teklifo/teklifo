import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { RequestForQuotation as RequestForQuotationType } from "@prisma/client";
import { ExternalLinkIcon } from "lucide-react";
import { format } from "date-fns";

type QuotationBaseProps = {
  rfq: RequestForQuotationType;
};

const QuotationBase = async ({ rfq }: QuotationBaseProps) => {
  const t = await getTranslations("Quotation");

  return (
    <h3 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
      {t.rich("quotationBase", {
        number: rfq.number,
        date: format(rfq.createdAt, "dd.MM.yyyy"),
        link: (chunk) => (
          <Link
            href={`/rfq/${rfq.id}`}
            target="_blank"
            className="underline underline-offset-4"
          >
            {chunk}
            <ExternalLinkIcon className="ml-2 inline" />
          </Link>
        ),
      })}
    </h3>
  );
};

export default QuotationBase;
