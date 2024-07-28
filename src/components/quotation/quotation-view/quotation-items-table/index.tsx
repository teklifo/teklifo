import { columns, QuotationItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: QuotationItemType[];
};

const QuotationItemsTable = ({ items }: Props) => {
  return (
    <div className="mx-auto">
      <DataTable columns={columns} data={items} />
    </div>
  );
};

export default QuotationItemsTable;
