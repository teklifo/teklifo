"use client";

import { useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

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
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t(lable)}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };

  return TableHeader;
}

function getVatRateCell(varRate: string) {
  const VatRateCell = () => {
    const t = useTranslations("QuotationItems");
    return <div className="text-center">{t(varRate)}</div>;
  };

  return VatRateCell;
}

function getVatIncludedCell(vatIncluded: boolean) {
  const VatIncludedCell = () => {
    const t = useTranslations("QuotationItems");
    return (
      <div className="text-center">{vatIncluded ? t("yes") : t("no")}</div>
    );
  };

  return VatIncludedCell;
}

export const columns: ColumnDef<QuotationItemType>[] = [
  {
    accessorKey: "rfqItem.lineNumber",
    header: getTableHeader("lineNumber"),
    cell: (info) => {
      return (
        <div className="text-center">{(info.getValue() as number) + 1}</div>
      );
    },
  },
  {
    accessorKey: "rfqItem",
    header: getTableHeader("product"),
    cell: (info) => {
      const rfqItem = info.getValue() as any;

      return rfqItem.productId ? (
        <Link
          href={`/product/${rfqItem.productId}`}
          className="block w-full text-center "
        >
          <span className="underline underline-offset-4">
            {rfqItem.productName}
          </span>
        </Link>
      ) : (
        <div className="text-center">{rfqItem.productName}</div>
      );
    },
    size: 820,
  },
  {
    accessorKey: "rfqItem.quantity",
    header: getTableHeader("rfqQuantity"),
    cell: (info) => {
      return (
        <div className="text-center">{Number(info.getValue()).toFixed(3)}</div>
      );
    },
  },
  {
    accessorKey: "rfqItem.price",
    header: getTableHeader("rfqPrice"),
    cell: (info) => {
      return (
        <div className="text-center">{Number(info.getValue()).toFixed(2)}</div>
      );
    },
  },
  {
    accessorKey: "rfqItem.deliveryDate",
    header: getTableHeader("rfqDeliveryDate"),
    cell: (info) => {
      return (
        <div className="text-center">
          {format(info.getValue() as string, "dd.MM.yyyy")}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: getTableHeader("quantity"),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {Number(row.getValue("quantity")).toFixed(3)}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: getTableHeader("price"),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {Number(row.getValue("price")).toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: getTableHeader("amount"),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {Number(row.getValue("amount")).toFixed(2)}
        </div>
      );
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
      return (
        <div className="text-center">
          {Number(row.getValue("vatAmount")).toFixed(2)}
        </div>
      );
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
      return (
        <div className="text-center">
          {Number(row.getValue("amountWithVat")).toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "deliveryDate",
    header: getTableHeader("deliveryDate"),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {format(row.getValue("deliveryDate"), "dd.MM.yyyy")}
        </div>
      );
    },
  },
];
