import { columns, StockBalanceType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  stock: StockBalanceType[];
};

const StockBalance = ({ stock }: Props) => {
  return (
    <div className="mx-auto">
      <DataTable columns={columns} data={stock} />
    </div>
  );
};

export default StockBalance;
