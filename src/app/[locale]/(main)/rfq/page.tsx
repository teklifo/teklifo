import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FileInput } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQFilters from "./_components/rfq-filters";
import RFQCard from "@/components/rfq/rfq-card";
import PaginationBar from "@/components/ui/pagination-bar";
import request from "@/lib/request";
import { PaginationType, RFQWithQuotationsType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
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

const getRFQs = async (page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(`/api/rfq?page=${page}&limit=10`, {
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

const RFQSearch = async ({ searchParams: { page } }: Props) => {
  const data = await getRFQs(page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("RFQSearch");

  return (
    <div className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-4">
      <div className="mt-4 col-span-9">
        <MaxWidthWrapper className="mt-8 mb-16">
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
          <PaginationBar href={`/my-rfq?page=`} pagination={pagination} />
          <div />
        </MaxWidthWrapper>
      </div>
      <div className="col-span-3 border">
        <RFQFilters />
      </div>
    </div>
  );
};

export default RFQSearch;
