import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Import, Package, Plus } from "lucide-react";
import { Link } from "@/navigation";
import queryString from "query-string";
import ProductSearchInput from "./_components/product-search-input";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import ProductCard from "@/components/product/product-card";
import PaginationBar from "@/components/ui/pagination-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { ProductWithPricesAndStocks, PaginationType } from "@/types";
import ProductsTable from "./_components/products-table";

type SearchParams = {
  query?: string;
  page?: number;
};

type Props = {
  params: { locale: string };
  searchParams: SearchParams;
};

type PaginatedData = {
  result: ProductWithPricesAndStocks[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("companyProductsTitle"),
    description: t("companyProductsDescription"),
  };
};

const getCompanyProducts = async (
  companyId: string,
  searchParams: SearchParams
) => {
  const queryParams = queryString.stringify(
    {
      ...searchParams,
      limit: 10,
      page: searchParams.page ?? 1,
    },
    {
      skipNull: true,
      skipEmptyString: true,
    }
  );

  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/product?${queryParams}`,
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

const Products = async ({ searchParams }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyProducts(company.id, searchParams);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("CompanyProducts");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        {isAdmin && <ProductsUploadMenu />}
      </div>
      <div className="mt-4">
        <ProductSearchInput defaultQuery={searchParams.query} />
        {result.length > 0 ? (
          <>
            <div className="hidden pt-4 md:block">
              <ProductsTable products={result} />
            </div>
            <div className="flex flex-col space-y-3 pt-4 md:hidden">
              {result.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
            <Package className="w-48 h-48 text-foreground" />
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("noProducts")}
            </h2>
            {isAdmin && (
              <>
                <span className="leading-7 tracking-tight max-w-sm text-muted-foreground">
                  {t("noProductsHint")}
                </span>
                <ProductsUploadMenu />
              </>
            )}
          </div>
        )}
        <PaginationBar href={`/products?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

async function ProductsUploadMenu() {
  const t = await getTranslations("CompanyProducts");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="space-x-2">
          <Plus />
          <span>{t("add")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link
            href={`/new-product`}
            className="flex items-center w-full space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("create")}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href={`/import-data`}
            className="flex items-center w-full space-x-2"
          >
            <Import className="h-4 w-4" />
            <span>{t("import")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Products;
