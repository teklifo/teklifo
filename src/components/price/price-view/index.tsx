import { columns, PriceType } from "./columns";
import { DataTable } from "@/components/ui/data-table";

type Props = {
  prices: PriceType[];
};

const PriceView = ({ prices }: Props) => {
  return (
    <div className="relative mx-auto">
      <DataTable columns={columns} data={prices} />
    </div>
  );
};

export default PriceView;
