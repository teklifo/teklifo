"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";

export type RFQItemType = Prisma.RequestForQuotationItemGetPayload<{
  include: {
    product: true;
  };
}>;

function getTableHeader(lable: string) {
  const TableHeader = ({ column }: HeaderContext<RFQItemType, unknown>) => {
    const t = useTranslations("RFQ");
    return (
      <Button
        variant="ghost"
        className={cn(
          "inline-flex items-center justify-center whitespace-normal text-xs"
        )}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{t(lable)}</span>
        <ChevronsUpDown className="block ml-2 shrink-0 h-4 w-4" />
      </Button>
    );
  };

  return TableHeader;
}

function getMoneyCell(number: number) {
  const MoneyCell = () => {
    const format = useFormatter();
    return (
      <span>
        {format.number(number, { style: "decimal", minimumFractionDigits: 2 })}
      </span>
    );
  };

  return MoneyCell;
}

function getDateCell(date: Date) {
  const MoneyCell = () => {
    const format = useFormatter();
    return <span>{format.dateTime(date, { dateStyle: "medium" })}</span>;
  };

  return MoneyCell;
}

function getQuantityCell(number: number) {
  const QuantityCell = () => {
    const format = useFormatter();
    return (
      <span>
        {format.number(number, { style: "decimal", minimumFractionDigits: 3 })}
      </span>
    );
  };

  return QuantityCell;
}
export const columns: ColumnDef<RFQItemType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    size: 20,
  },
  {
    accessorKey: "lineNumber",
    header: getTableHeader("lineNumber"),
    cell: (info) => {
      return <>{(info.getValue() as number) + 1}</>;
    },
    size: 20,
  },
  {
    accessorKey: "product",
    header: getTableHeader("product"),
    cell: ({ row }) => {
      const productId = row.original.productId;
      const productName = row.original.productName;

      return productId ? (
        <Link
          href={`/products/${productId}`}
          className="block w-full"
          target="_blank"
        >
          <span className="underline underline-offset-4">{productName}</span>
        </Link>
      ) : (
        <>{productName}</>
      );
    },
    size: 350,
  },
  {
    accessorKey: "quantity",
    header: getTableHeader("quantity"),
    cell: ({ row }) => {
      const Cell = getQuantityCell(Number(row.original.quantity));
      return <Cell />;
    },
  },
  {
    accessorKey: "price",
    header: getTableHeader("price"),
    cell: ({ row }) => {
      const Cell = getMoneyCell(Number(row.original.price));
      return <Cell />;
    },
  },
  {
    accessorKey: "deliveryDate",
    header: getTableHeader("deliveryDate"),
    cell: ({ row }) => {
      const Cell = getDateCell(new Date(row.getValue("deliveryDate")));
      return <Cell />;
    },
  },
  {
    accessorKey: "comment",
    header: getTableHeader("comment"),
    cell: (info) => {
      return (
        <p className="max-w-sm line-clamp-1">{info.getValue() as string}</p>
      );
    },
  },
];
