"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ColumnDef,
  ColumnResizeDirection,
  ColumnResizeMode,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DatatableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DatatableProps<TData, TValue>) {
  const t = useTranslations("Layout");

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnResizeMode, setColumnResizeMode] =
    React.useState<ColumnResizeMode>("onChange");

  const [columnResizeDirection, setColumnResizeDirection] =
    React.useState<ColumnResizeDirection>("ltr");

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div style={{ direction: table.options.columnResizeDirection }}>
      <Table
        className="min-w-full"
        {...{
          style: {
            width: table.getCenterTotalSize(),
          },
        }}
      >
        <TableHeader className="sticky top-[-1px] bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="border h-15"
                  {...{
                    colSpan: header.colSpan,
                    style: {
                      width: header.getSize(),
                    },
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  <div
                    {...{
                      onDoubleClick: () => header.column.resetSize(),
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `resizer ${
                        table.options.columnResizeDirection
                      } ${header.column.getIsResizing() ? "isResizing" : ""}`,
                      style: {
                        transform:
                          columnResizeMode === "onEnd" &&
                          header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === "rtl"
                                  ? -1
                                  : 1) *
                                (table.getState().columnSizingInfo
                                  .deltaOffset ?? 0)
                              }px)`
                            : "",
                      },
                    }}
                  />
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-3 py-2 text-sm border"
                    {...{
                      style: {
                        width: cell.column.getSize(),
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center border"
              >
                {t("noData")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
