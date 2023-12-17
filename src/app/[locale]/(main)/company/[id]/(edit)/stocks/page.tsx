import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Stock as StockType } from "@prisma/client";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Pagination from "@/components/ui/pagination";
import StockForm from "@/components/stock-form";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string; id: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: StockType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("stocksTitle"),
    description: t("stocksDescription"),
  };
};

const getCompanyStocks = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/stock?page=${page}&limit=10`,
      {
        headers: {
          "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
          Cookie: cookie,
        },
        cache: "no-cache",
      }
    );
  } catch (error) {
    return undefined;
  }
};

const Stocks = async ({ params: { id }, searchParams: { page } }: Props) => {
  const data = await getCompanyStocks(id, page ?? 1);
  if (!data) return notFound();
  return <StocksContent data={data} companyId={id} />;
};

const StocksContent = ({
  companyId,
  data: { result, pagination },
}: {
  companyId: string;
  data: PaginatedData;
}) => {
  const t = useTranslations("Stock");

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <StockForm companyId={companyId} />
      </div>
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("id")}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock.name}</TableCell>
                <TableCell>{stock.id}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t("openMenu")}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>{t("edit")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash className="mr-2 h-4 w-4" />
                        <span>{t("delete")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          href={`/${companyId}/stocks?page=`}
          pagination={pagination}
        />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default Stocks;
