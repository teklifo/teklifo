import { columns, RFQItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: RFQItemType[];
};

const RFQItemsTable = ({ items }: Props) => {
  return (
    <div className="mt-4">
      <DataTable columns={columns} data={items} />
    </div>
  );
};

export default RFQItemsTable;
