"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { QuotationsByRFQItemType } from "@/types";
import QuotationCell from "./quotation-cell";
import ProductCell from "./product-cell";

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
    return (
      <div className="p-4">
        <Link
          href={`/company/${quotationCompany.id}`}
          target="_blank"
          className="text-lg font-semibold"
        >
          {quotationCompany.name}
        </Link>
      </div>
    );
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
      cell: ({ row }) => {
        const quotationRow = row.original.quotationItems.find(
          (item) => item.quotation.company.id === quotationCompany.id
        );
        if (!quotationRow) return "-";

        return <QuotationCell quotationRow={quotationRow} />;
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
      size: 0,
    },
    {
      accessorKey: "product",
      header: getTableHeader("product"),
      cell: ({ row }) => {
        return <ProductCell row={row.original} />;
      },
      size: 500,
    },
    ...quotationsColumns,
  ];
}
