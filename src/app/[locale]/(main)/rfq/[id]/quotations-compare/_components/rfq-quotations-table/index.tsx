import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { QuotationsByRFQItemType } from "@/types";

type Props = {
  rfqQuotations: QuotationsByRFQItemType[];
};

const RFQQuotationsTable = ({ rfqQuotations }: Props) => {
  return (
    <div className="mx-auto">
      <DataTable columns={columns} data={rfqQuotations} />
    </div>
  );
};

export default RFQQuotationsTable;
