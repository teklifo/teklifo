import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Product as ProductType } from "@prisma/client";
import BackButton from "@/components/back-button";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import ProductForm from "@/components/product/product-form";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("updateProductTitle"),
    description: t("updateProductDescription"),
  };
};

const getProduct = async (productId: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<ProductType>(`/api/product/${productId}`, {
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

const NewProduct = async ({ params: { id } }: Props) => {
  const product = await getProduct(id);
  if (!product) return notFound();

  const company = await getCurrentCompany();
  if (!company || company.id !== product.companyId) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) return notFound();

  const t = await getTranslations("ProductForm");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2">
        <div className="flex justify-start items-center space-x-4">
          <BackButton href={`/products/${id}`} />
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("updateTitle")}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{t("updateSubtitle")}</p>
      </div>
      <div className="mt-4">
        <ProductForm product={product} />
      </div>
    </MaxWidthWrapper>
  );
};

export default NewProduct;
