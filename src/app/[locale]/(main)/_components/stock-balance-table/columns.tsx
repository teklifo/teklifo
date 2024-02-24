"use client";

import { useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StockBalanceType = Prisma.StockBalanceGetPayload<{
  include: {
    stock: true;
  };
}>;

const StockHeader = () => {
  const t = useTranslations("StockBalance");
  return t("stock");
};

const QuantityHeader = ({
  column,
}: HeaderContext<StockBalanceType, unknown>) => {
  const t = useTranslations("StockBalance");
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {t("stock")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const columns: ColumnDef<StockBalanceType>[] = [
  {
    accessorKey: "stock.name",
    header: StockHeader,
  },
  {
    accessorKey: "quantity",
    header: QuantityHeader,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.getValue("quantity")}</div>
      );
    },
  },
];
