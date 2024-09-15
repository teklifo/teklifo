import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Stock as StockType } from "@prisma/client";
import { MoreHorizontal, Warehouse } from "lucide-react";
import StockForm from "./_components/stock-form";
import DeleteStock from "./_components/delete-stock";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PaginationBar from "@/components/ui/pagination-bar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";

type Props = {
  params: { locale: string };
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
        next: { revalidate: 0 },
      }
    );
  } catch (error) {
    return undefined;
  }
};

const Stocks = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyStocks(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("Stock");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        {isAdmin && <StockForm companyId={company.id} />}
      </div>
      <div className="mt-4">
        {result.length > 0 ? (
          <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2">
            {result.map((stock) => (
              <Card key={stock.id} className="h-full w-full">
                <CardHeader>
                  <div className="flex flex-row justify-between">
                    <CardTitle>{stock.name}</CardTitle>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="flex flex-col"
                        >
                          <StockForm companyId={company.id} stock={stock} />
                          <DeleteStock
                            companyId={company.id}
                            stockId={stock.id}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <CardDescription>{`${t("id")}: ${stock.id}`}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
            <Warehouse className="w-48 h-48 text-foreground" />
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("noStocks")}
            </h2>
            {isAdmin && (
              <>
                <span className="leading-7 tracking-tight max-w-sm text-muted-foreground">
                  {t("noStocksHint")}
                </span>
                <StockForm companyId={company.id} />
              </>
            )}
          </div>
        )}
        <PaginationBar href={`/stocks?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default Stocks;
