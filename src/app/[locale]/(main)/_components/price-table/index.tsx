import { columns, PriceType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  prices: PriceType[];
};

const PriceTable = ({ prices }: Props) => {
  return (
    <div className="mx-auto">
      <DataTable columns={columns} data={prices} />
    </div>
  );
};

export default PriceTable;
