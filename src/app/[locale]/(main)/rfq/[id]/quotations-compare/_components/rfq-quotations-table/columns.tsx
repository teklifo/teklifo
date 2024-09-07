"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { Prisma } from "@prisma/client";
import { getTopQuotationItemsPerRFQ } from "@prisma/client/sql";
import QuotationCell from "./quotation-cell";
import ProductCell from "./product-cell";
import { QuotationsByRFQItemType } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

export type QuotationsItemType = Prisma.QuotationItemGetPayload<{
  include: {
    quotation: {
      select: {
        id: true;
        totalAmount: true;
        currency: true;
        vatIncluded: true;
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

type QuotationType = {
  id: number;
  totalAmount: Decimal;
  currency: string;
  company: { id: string; name: string };
};

function getTableHeader(lable: string) {
  const TableHeader = ({
    column,
  }: HeaderContext<QuotationsByRFQItemType, unknown>) => {
    const t = useTranslations("QuotationsCompare");
    return <span>{t(lable)}</span>;
  };

  return TableHeader;
}

function getQuotationCompanyHeader(quotation: QuotationType) {
  const TableHeader = ({
    column,
  }: HeaderContext<QuotationsByRFQItemType, unknown>) => {
    const t = useTranslations("QuotationsCompare");
    const format = useFormatter();
    return (
      <div className="p-4">
        <Link
          href={`/company/${quotation.company.id}`}
          target="_blank"
          className="text-lg font-semibold"
        >
          {quotation.company.name}
        </Link>
        <div className="flex flex-row justify-start items-center space-x-2">
          <span>{`${t("totalAmount")}:`}</span>
          <span>
            {format.number(Number(quotation.totalAmount), {
              style: "currency",
              currency: quotation.currency,
            })}
          </span>
        </div>
      </div>
    );
  };

  return TableHeader;
}

export function createColumns(
  quotationItems: QuotationsItemType[],
  topQuotations: getTopQuotationItemsPerRFQ.Result[]
): ColumnDef<QuotationsByRFQItemType>[] {
  const quotationsColumns: ColumnDef<QuotationsByRFQItemType>[] = [];

  quotationItems.map((quotationItem) => {
    const quotationColumn: ColumnDef<QuotationsByRFQItemType> = {
      accessorKey: `quotationItem${quotationItem.id}`,
      header: getQuotationCompanyHeader(quotationItem.quotation),
      cell: ({ row }) => {
        const topQuotationsByRow = topQuotations.filter(
          (topQuotation) => topQuotation.id === row.original.id
        );
        const position = topQuotationsByRow.findIndex(
          (topQuotationByRow) =>
            topQuotationByRow.quotationid === quotationItem.quotation.id
        );

        return (
          <QuotationCell
            row={row.original}
            quotationId={quotationItem.quotationId}
            position={position}
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
