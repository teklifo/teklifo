import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import { ChevronLeft } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import StockBalanceForm from "@/components/stock-balance/stock-balance-form";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
import { ProductAndStocks } from "@/types";

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale, id: productId },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const data = await getProductStockBalance(productId);
  if (!data)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("stockBalanceTitle", {
      productName: data.product.name,
    }),
    description: t("stockBalanceDescription"),
  };
};

async function getProductStockBalance(productId: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<ProductAndStocks>(
      `/api/product/${productId}/stock-balance`,
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
}

const StockBalance = async ({ params: { id: productId } }: Props) => {
  const t = await getTranslations("StockBalance");

  const data = await getProductStockBalance(productId);
  if (!data) return notFound();

  let isAdmin = true;
  const userCompany = await getCurrentCompany();
  if (userCompany && userCompany.id === "0") {
    isAdmin = await isCompanyAdmin(userCompany.id);
  }

  if (!isAdmin) return notFound();

  const { product, stocks } = data;

  return (
    <MaxWidthWrapper className="mt-8 mb-20">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <div className="flex justify-center items-center space-x-4">
            <Link
              href={`/products/${productId}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "space-x-2"
              )}
            >
              <ChevronLeft className="w-4 -h-4" />
            </Link>
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
              {t("stockBalanceTitle", {
                productName: product.name,
              })}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t("stockBalanceSubtitle")}
          </p>
        </div>
      </div>
      <StockBalanceForm productId={product.id} stocks={stocks} />
    </MaxWidthWrapper>
  );
};

export default StockBalance;
