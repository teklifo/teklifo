"use client";

import { createColumns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { QuotationsByRFQItemType } from "@/types";

type Props = {
  rfqQuotations: QuotationsByRFQItemType[];
};

const RFQQuotationsTable = ({ rfqQuotations }: Props) => {
  const quotationItems =
    rfqQuotations.length > 0 ? rfqQuotations[0].quotationItems : [];
  const columns = createColumns(quotationItems);

  return <DataTable columns={columns} data={rfqQuotations} />;
};

export default RFQQuotationsTable;
