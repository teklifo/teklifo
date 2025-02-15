"use client";

import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { getTopQuotationItemsPerRFQ } from "@prisma/client/sql";
import { QuotationsByRFQItemType } from "@/types";

type Props = {
  rfqQuotations: QuotationsByRFQItemType[];
  topQuotations: getTopQuotationItemsPerRFQ.Result[];
  currency: string;
};

const RFQQuotationsTable = ({
  rfqQuotations,
  topQuotations,
  currency,
}: Props) => {
  const quotation = rfqQuotations.length > 0 ? rfqQuotations[0] : null;

  if (!quotation) return null;

  const columns = createColumns(
    quotation.quotationItems,
    topQuotations,
    currency
  );

  return (
    <div className="relative">
      <DataTable columns={columns} data={rfqQuotations} />
    </div>
  );
};

export default RFQQuotationsTable;
