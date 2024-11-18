import { ClassValue } from "clsx";
import { createColumns, RFQItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: RFQItemType[];
  scrollClass?: ClassValue;
  selectRows: boolean;
  onSelectedRowsChange?: (value: RFQItemType[]) => void;
  initialSelectState?: Record<string, boolean>;
};

const RFQItemsTable = ({
  items,
  scrollClass,
  selectRows,
  onSelectedRowsChange,
  initialSelectState,
}: Props) => {
  const columns = createColumns(selectRows);

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
