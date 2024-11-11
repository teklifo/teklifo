import { ClassValue } from "clsx";
import { columns, RFQItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: RFQItemType[];
  scrollClass?: ClassValue;
};

const RFQItemsTable = ({ items, scrollClass }: Props) => {
  return (
    <div className="mt-4">
      <DataTable columns={columns} data={items} scrollClass={scrollClass} />
    </div>
  );
};

export default RFQItemsTable;
