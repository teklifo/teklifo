import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PriceForm from "@/components/price/price-form";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { ProductAndPriceTypes } from "@/types";

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale, id: productId },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const data = await getProductPrices(productId);
  if (!data)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("pricesTitle", {
      productName: data.product.name,
    }),
    description: t("pricesDescription"),
  };
};

async function getProductPrices(productId: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<ProductAndPriceTypes>(
      `/api/product/${productId}/price`,
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

const Prices = async ({ params: { id: productId } }: Props) => {
  const t = await getTranslations("Prices");

  const data = await getProductPrices(productId);
  if (!data) return notFound();

  let isAdmin = true;
  const userCompany = await getCurrentCompany();
  if (userCompany && userCompany.id === "0") {
    isAdmin = await isCompanyAdmin(userCompany.id);
  }

  if (!isAdmin) return notFound();

  const { product, priceTypes } = data;

  return (
    <MaxWidthWrapper className="mt-8 mb-20">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <div className="flex justify-start items-center space-x-4">
            <BackButton defaultHref={`/products/${productId}`} />
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
              {t("pricesTitle", {
                productName: product.name,
              })}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">{t("pricesSubtitle")}</p>
        </div>
      </div>
      <PriceForm productId={product.id} priceTypes={priceTypes} />
    </MaxWidthWrapper>
  );
};

export default Prices;
