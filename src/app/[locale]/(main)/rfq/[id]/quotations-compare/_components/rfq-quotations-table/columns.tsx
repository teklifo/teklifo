"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { QuotationsByRFQItemType } from "@/types";

type QuotationCompany = { id: string; name: string };

function getTableHeader(lable: string) {
  const TableHeader = ({
    column,
  }: HeaderContext<QuotationsByRFQItemType, unknown>) => {
    const t = useTranslations("QuotationsCompare");
    return <span>{t(lable)}</span>;
  };

  return TableHeader;
}

function getQuotationCompanyHeader(quotationCompany: QuotationCompany) {
  const TableHeader = ({
    column,
  }: HeaderContext<QuotationsByRFQItemType, unknown>) => {
    const t = useTranslations("QuotationsCompare");
    return <span>{quotationCompany.name}</span>;
  };

  return TableHeader;
}

export function createColumns(
  quotationCompanies: QuotationCompany[]
): ColumnDef<QuotationsByRFQItemType>[] {
  const quotationsColumns: ColumnDef<QuotationsByRFQItemType>[] = [];

  quotationCompanies.map((quotationCompany) => {
    const quotationColumn: ColumnDef<QuotationsByRFQItemType> = {
      accessorKey: `quotationItem${quotationCompany.id}`,
      header: getQuotationCompanyHeader(quotationCompany),
      cell: (info) => {
        return <>{(info.getValue() as number) + 1}</>;
      },
    };

    quotationsColumns.push(quotationColumn);
  });

  return [
    {
      accessorKey: "lineNumber",
      header: getTableHeader("lineNumber"),
      cell: (info) => {
        return <>{(info.getValue() as number) + 1}</>;
      },
    },
    {
      accessorKey: "product",
      header: getTableHeader("product"),
      cell: ({ row }) => {
        const product = row.original.product;
        const productName = row.original.productName;

        return product?.productId ? (
          <Link href={`/product/${product.productId}`} className="block w-full">
            <span className="underline underline-offset-4">{productName}</span>
          </Link>
        ) : (
          <>{productName}</>
        );
      },
      size: 500,
    },
    ...quotationsColumns,
  ];
}

export const columns: ColumnDef<QuotationsByRFQItemType>[] = [
  {
    accessorKey: "lineNumber",
    header: getTableHeader("lineNumber"),
    cell: (info) => {
      return <>{(info.getValue() as number) + 1}</>;
    },
  },
  {
    accessorKey: "product",
    header: getTableHeader("product"),
    cell: ({ row }) => {
      const product = row.original.product;
      const productName = row.original.productName;

      return product?.productId ? (
        <Link href={`/product/${product.productId}`} className="block w-full">
          <span className="underline underline-offset-4">{productName}</span>
        </Link>
      ) : (
        <>{productName}</>
      );
    },
    size: 500,
  },
];
