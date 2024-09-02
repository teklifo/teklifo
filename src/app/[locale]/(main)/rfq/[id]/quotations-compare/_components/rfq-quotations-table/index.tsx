"use client";

import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { getTopQuotationItemsPerRFQ } from "@prisma/client/sql";
import { QuotationsByRFQItemType } from "@/types";

type Props = {
  rfqQuotations: QuotationsByRFQItemType[];
  topQuotations: getTopQuotationItemsPerRFQ.Result[];
};

const RFQQuotationsTable = ({ rfqQuotations, topQuotations }: Props) => {
  const quotationItems =
    rfqQuotations.length > 0 ? rfqQuotations[0].quotationItems : [];
  const columns = createColumns(quotationItems, topQuotations);

  return <DataTable columns={columns} data={rfqQuotations} />;
};

export default RFQQuotationsTable;
