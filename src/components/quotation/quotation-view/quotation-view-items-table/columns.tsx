"use client";

import { useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const t = useTranslations("QuotationItems");
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
    const t = useTranslations("QuotationItems");
    return <>{t(varRate)}</>;
  };

  return VatRateCell;
}

function getVatIncludedCell(vatIncluded: boolean) {
  const VatIncludedCell = () => {
    const t = useTranslations("QuotationItems");
    return <>{vatIncluded ? t("yes") : t("no")}</>;
  };

  return VatIncludedCell;
}

export const columns: ColumnDef<QuotationItemType>[] = [
  {
    accessorKey: "rfqItem.lineNumber",
    header: getTableHeader("lineNumber"),
    cell: (info) => {
      return <>{(info.getValue() as number) + 1}</>;
    },
  },
  {
    accessorKey: "rfqItem",
    header: getTableHeader("product"),
    cell: (info) => {
      const rfqItem = info.getValue() as any;

      return rfqItem.productId ? (
        <Link href={`/product/${rfqItem.productId}`} className="block w-full">
          <span className="underline underline-offset-4">
            {rfqItem.productName}
          </span>
        </Link>
      ) : (
        <>{rfqItem.productName}</>
      );
    },
    size: 500,
  },
  {
    accessorKey: "rfqItem.quantity",
    header: getTableHeader("rfqQuantity"),
    cell: (info) => {
      return <>{Number(info.getValue()).toFixed(3)}</>;
    },
  },
  {
    accessorKey: "quantity",
    header: getTableHeader("quantity"),
    cell: ({ row }) => {
      return <>{Number(row.getValue("quantity")).toFixed(3)}</>;
    },
  },
  {
    accessorKey: "rfqItem.price",
    header: getTableHeader("rfqPrice"),
    cell: (info) => {
      return <>{Number(info.getValue()).toFixed(2)}</>;
    },
  },
  {
    accessorKey: "price",
    header: getTableHeader("price"),
    cell: ({ row }) => {
      return <>{Number(row.getValue("price")).toFixed(2)}</>;
    },
  },

  {
    accessorKey: "amount",
    header: getTableHeader("amount"),
    cell: ({ row }) => {
      return <>{Number(row.getValue("amount")).toFixed(2)}</>;
    },
  },
  {
    accessorKey: "vatRate",
    header: getTableHeader("vatRate"),
    cell: ({ row }) => {
      const VatRateCell = getVatRateCell(row.getValue("vatRate"));
      return <VatRateCell />;
    },
  },
  {
    accessorKey: "vatAmount",
    header: getTableHeader("vatAmount"),
    cell: ({ row }) => {
      return <>{Number(row.getValue("vatAmount")).toFixed(2)}</>;
    },
  },
  {
    accessorKey: "vatIncluded",
    header: getTableHeader("vatIncluded"),
    cell: ({ row }) => {
      const VatIncludedCell = getVatIncludedCell(row.getValue("vatIncluded"));
      return <VatIncludedCell />;
    },
  },
  {
    accessorKey: "amountWithVat",
    header: getTableHeader("amountWithVat"),
    cell: ({ row }) => {
      return <>{Number(row.getValue("amountWithVat")).toFixed(2)}</>;
    },
  },
  {
    accessorKey: "rfqItem.deliveryDate",
    header: getTableHeader("rfqDeliveryDate"),
    cell: (info) => {
      return <>{format(info.getValue() as string, "dd.MM.yyyy")}</>;
    },
  },
  {
    accessorKey: "deliveryDate",
    header: getTableHeader("deliveryDate"),
    cell: ({ row }) => {
      return <>{format(row.getValue("deliveryDate"), "dd.MM.yyyy")}</>;
    },
  },
];
