import { ClassValue } from "clsx";
import { columns, RFQItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: RFQItemType[];
  scrollClass?: ClassValue;
  onSelectedRowsChange?: (value: RFQItemType[]) => void;
  initialSelectState?: Record<string, boolean>;
};

const RFQItemsTable = ({
  items,
  scrollClass,
  onSelectedRowsChange,
  initialSelectState,
}: Props) => {
  return (
    <div className="mt-4">
      <DataTable
        columns={columns}
        data={items}
        scrollClass={scrollClass}
        onSelectedRowsChange={onSelectedRowsChange}
        initialSelectState={initialSelectState}
      />
    </div>
  );
};

export default RFQItemsTable;
