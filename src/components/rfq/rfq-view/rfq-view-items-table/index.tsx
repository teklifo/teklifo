import { ClassValue } from "clsx";
import { columns, RFQItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: RFQItemType[];
  scrollClass?: ClassValue;
  onSelectedRowsChange?: (value: RFQItemType[]) => void;
};

const RFQItemsTable = ({ items, scrollClass, onSelectedRowsChange }: Props) => {
  return (
    <div className="mt-4">
      <DataTable
        columns={columns}
        data={items}
        scrollClass={scrollClass}
        onSelectedRowsChange={onSelectedRowsChange}
      />
    </div>
  );
};

export default RFQItemsTable;
