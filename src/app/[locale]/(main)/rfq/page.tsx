import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FileInput, ListFilter } from "lucide-react";
import RFQFilters from "./_components/rfq-filters";
import RFQCard from "@/components/rfq/rfq-card";
import PaginationBar from "@/components/ui/pagination-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import request from "@/lib/request";
import { PaginationType, RFQWithQuotationsType } from "@/types";
import queryString from "query-string";

type SearchParams = {
  page?: number;
  limit?: number;
};

type Props = {
  params: { locale: string };
  searchParams: SearchParams;
};

type PaginatedData = {
  result: RFQWithQuotationsType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("RFQTitle"),
    description: t("RFQDescription"),
  };
};

const getRFQs = async (searchParams: SearchParams) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    const query = searchParamsString(searchParams);

    return await request<PaginatedData>(`/api/rfq?${query}`, {
      headers: {
        "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
        Cookie: cookie,
      },
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
};

function searchParamsString(searchParams: SearchParams) {
  return queryString.stringify(searchParams);
}

const RFQSearch = async ({ searchParams }: Props) => {
  const data = await getRFQs({
    ...searchParams,
    limit: 1,
    page: searchParams.page ?? 1,
  });
  if (!data) return notFound();

  const { result, pagination } = data;

  const paramsString = searchParamsString({ ...searchParams, page: undefined });

  const t = await getTranslations("RFQSearch");

  return (
    <div className="relative min-h-screen grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-4">
      <div className="mt-4 col-span-9">
        <div className="mx-auto w-full max-w-screen-xl px-2.5 lg:px-20 mt-8 mb-16">
          <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
            <div className="space-y-2">
              <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
          {result.length > 0 ? (
            <div className="flex flex-col space-y-3 pt-4">
              {result.map((rfq) => (
                <RFQCard key={rfq.id} rfq={rfq} />
              ))}
            </div>
          ) : (
            <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
              <FileInput className="w-48 h-48 text-foreground" />
              <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("noRFQ")}
              </h2>
              <p className="leading-7 tracking-tight max-w-sm text-muted-foreground">
                {t("noRFQHint")}
              </p>
            </div>
          )}
          <PaginationBar
            href={`/rfq?${paramsString}&page=`}
            pagination={pagination}
          />
          <div />
        </div>
      </div>
      <div className="hidden sticky top-0 !h-[calc(100vh-4rem)] col-span-3 border md:block">
        <RFQFilters />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <div className="fixed bottom-0 right-0 m-8 md:hidden">
            <Button className="rounded-full h-14 w-14">
              <ListFilter className="h-5 w-5" />
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent>
          <RFQFilters />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RFQSearch;