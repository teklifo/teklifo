import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { PriceType as PriceTypeType } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Pagination from "@/components/ui/pagination";
import PriceTypeForm from "@/components/price-types/price-type-form";
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
import DeletePriceType from "@/components/price-types/delete-price-type";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string; id: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: PriceTypeType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("priceTypesTitle"),
    description: t("priceTypesDescription"),
  };
};

const getCompanyPriceTypes = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/price-type?page=${page}&limit=10`,
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

const PriceTypes = async ({
  params: { id },
  searchParams: { page },
}: Props) => {
  const data = await getCompanyPriceTypes(id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("PriceType");

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <PriceTypeForm companyId={id} />
      </div>
      <div className="mt-4">
        {result.length > 0 && (
          <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2 lg:grid-cols-3">
            {result.map((priceType) => (
              <Card key={priceType.id} className="h-full w-full">
                <CardHeader>
                  <div className="flex flex-row justify-between">
                    <CardTitle>{priceType.name}</CardTitle>
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
                        <PriceTypeForm companyId={id} priceType={priceType} />
                        <DeletePriceType
                          companyId={id}
                          priceTypeId={priceType.id}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{`${t("currency")}: ${
                    priceType.currency
                  }`}</CardDescription>
                  <CardDescription>{`${t("id")}: ${
                    priceType.id
                  }`}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        <Pagination href={`/${id}/price-types?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default PriceTypes;
