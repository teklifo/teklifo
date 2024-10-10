"use client";

import { useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PriceType = Prisma.PriceGetPayload<{
  include: {
    priceType: true;
  };
}>;

const PriceTypeHeader = () => {
  const t = useTranslations("Prices");
  return t("priceType");
};

const PriceHeader = ({ column }: HeaderContext<PriceType, unknown>) => {
  const t = useTranslations("Prices");
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {t("price")}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const PriceCurrencyHeader = () => {
  const t = useTranslations("Prices");
  return t("currency");
};

export const columns: ColumnDef<PriceType>[] = [
  {
    accessorKey: "priceType.name",
    header: PriceTypeHeader,
  },
  {
    accessorKey: "price",
    header: PriceHeader,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.getValue("price")}</div>
      );
    },
  },
  {
    accessorKey: "priceType.currency",
    header: PriceCurrencyHeader,
  },
];
