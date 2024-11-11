import { ClassValue } from "clsx";
import { columns, QuotationItemType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  items: QuotationItemType[];
  scrollClass?: ClassValue;
};

const QuotationItemsTable = ({ items, scrollClass }: Props) => {
  return (
    <div className="mt-4">
      <DataTable columns={columns} data={items} scrollClass={scrollClass} />
    </div>
  );
};

export default QuotationItemsTable;
