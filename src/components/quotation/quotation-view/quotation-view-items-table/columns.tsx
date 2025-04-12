"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientDate from "@/components/client-date";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";

export type QuotationItemType = Prisma.QuotationItemGetPayload<{
  include: {
    product: true;
    rfqItem: true;
  };
}>;

function getTableHeader(lable: string) {
  const TableHeader = ({
    column,
  }: HeaderContext<QuotationItemType, unknown>) => {
    const t = useTranslations("Quotation");
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

function getVatRateCell(varRate: string) {
  const VatRateCell = () => {
    const t = useTranslations("Quotation");
    return <>{t(varRate)}</>;
  };

  return VatRateCell;
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
    return (
      <span>
        <ClientDate date={date} format="dd.MM.yyyy" />
      </span>
    );
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

const EmptyCell = () => {
  return <p className="text-center">-</p>;
};

export const columns: ColumnDef<QuotationItemType>[] = [
  {
    accessorKey: "rfqItem.lineNumber",
    header: getTableHeader("lineNumber"),
    cell: (info) => {
      return <>{(info.getValue() as number) + 1}</>;
    },
    size: 0,
  },
  {
    accessorKey: "rfqItem",
    header: getTableHeader("product"),
    cell: (info) => {
      const rfqItem = info.getValue() as any;

      return rfqItem.productId ? (
        <Link
          href={`/products/${rfqItem.productId}`}
          className="block w-full"
          target="_blank"
        >
          <span className="underline underline-offset-4">
            {rfqItem.productName}
          </span>
        </Link>
      ) : (
        <>{rfqItem.productName}</>
      );
    },
    size: 350,
  },
  {
    accessorKey: "rfqItem.quantity",
    header: getTableHeader("rfqQuantity"),
    cell: (info) => {
      const Cell = getQuantityCell(Number(info.row.original.rfqItem.quantity));
      return <Cell />;
    },
    meta: {
      getCellContext: (_context: any) => {
        return {
          style: {
            fontWeight: "bold",
            minWidth: "30%",
            textTransform: "uppercase",
          },
          className: "bold",
        };
      },
    },
  },
  {
    accessorKey: "quantity",
    header: getTableHeader("quantity"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const Cell = getQuantityCell(Number(row.original.quantity));
      return <Cell />;
    },
  },
  {
    accessorKey: "rfqItem.price",
    header: getTableHeader("rfqPrice"),
    cell: ({ row }) => {
      const Cell = getMoneyCell(Number(row.original.rfqItem.price));
      return <Cell />;
    },
  },
  {
    accessorKey: "price",
    header: getTableHeader("price"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const Cell = getMoneyCell(Number(row.original.price));
      return <Cell />;
    },
  },

  {
    accessorKey: "amount",
    header: getTableHeader("amount"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const Cell = getMoneyCell(Number(row.original.amount));
      return <Cell />;
    },
  },
  {
    accessorKey: "vatRate",
    header: getTableHeader("vatRate"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const VatRateCell = getVatRateCell(row.getValue("vatRate"));
      return <VatRateCell />;
    },
  },
  {
    accessorKey: "vatAmount",
    header: getTableHeader("vatAmount"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const Cell = getMoneyCell(Number(row.original.vatAmount));
      return <Cell />;
    },
  },
  {
    accessorKey: "amountWithVat",
    header: getTableHeader("amountWithVat"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const Cell = getMoneyCell(Number(row.original.amountWithVat));
      return <Cell />;
    },
  },
  {
    accessorKey: "rfqItem.deliveryDate",
    header: getTableHeader("rfqDeliveryDate"),
    cell: (info) => {
      const Cell = getDateCell(new Date(info.getValue() as Date));
      return <Cell />;
    },
  },
  {
    accessorKey: "deliveryDate",
    header: getTableHeader("deliveryDate"),
    cell: ({ row }) => {
      if (row.original.skip) return <EmptyCell />;
      const Cell = getDateCell(new Date(row.getValue("deliveryDate")));
      return <Cell />;
    },
  },
  {
    accessorKey: "rfqItem.comment",
    header: getTableHeader("rfqComment"),
    cell: (info) => {
      return (
        <p className="max-w-sm line-clamp-1">{info.getValue() as string}</p>
      );
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
