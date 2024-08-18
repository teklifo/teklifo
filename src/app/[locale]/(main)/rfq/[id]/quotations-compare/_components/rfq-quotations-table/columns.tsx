"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { Prisma } from "@prisma/client";
import QuotationCell from "./quotation-cell";
import ProductCell from "./product-cell";
import { QuotationsByRFQItemType } from "@/types";

export type QuotationsItemType = Prisma.QuotationItemGetPayload<{
  include: {
    quotation: {
      select: {
        id: true;
        rfq: {
          select: {
            latestVersion: true;
          };
        };
        company: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

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
  quotationItems: QuotationsItemType[]
): ColumnDef<QuotationsByRFQItemType>[] {
  const quotationsColumns: ColumnDef<QuotationsByRFQItemType>[] = [];

  quotationItems.map((quotationItem) => {
    const quotationColumn: ColumnDef<QuotationsByRFQItemType> = {
      accessorKey: `quotationItem${quotationItem.id}`,
      header: getQuotationCompanyHeader(quotationItem.quotation.company),
      cell: ({ row }) => {
        return (
          <QuotationCell
            row={row.original}
            quotationId={quotationItem.quotationId}
          />
        );
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
