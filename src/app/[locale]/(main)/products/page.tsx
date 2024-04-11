import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import ProductCard from "@/app/[locale]/(main)/_components/product-card";
import PaginationBar from "@/components/ui/pagination-bar";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { ProductWithPricesAndStocks, PaginationType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
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

const getCompanyProducts = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/product?page=${page}&limit=10`,
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

const Products = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyProducts(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("CompanyProducts");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        {isAdmin && <NewProductLink />}
      </div>
      <div className="mt-4">
        {result.length > 0 ? (
          <div className="flex flex-col space-y-3 pt-4">
            {result.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="my-8 flex flex-col justify-center items-center space-y-4 text-center">
            <Image
              src="/illustrations/not-found.svg"
              alt="No products"
              priority
              width="600"
              height="600"
              className="mb-4"
            />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
              {t("noProducts")}
            </h2>
            {isAdmin && (
              <>
                <span className="block text-xl text-muted-foreground">
                  {t("noProductsHint")}
                </span>
                <NewProductLink />
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

async function NewProductLink() {
  const t = await getTranslations("CompanyProducts");

  return (
    <Link
      href={`/new-product`}
      className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
    >
      <Plus />
      <span>{t("new")}</span>
    </Link>
  );
}

export default Products;
