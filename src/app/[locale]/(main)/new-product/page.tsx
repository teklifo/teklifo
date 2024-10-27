import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import ProductForm from "@/components/product/product-form";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("newProductTitle"),
    description: t("newProductDescription"),
  };
};

const NewProduct = async () => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) return notFound();

  const t = await getTranslations("ProductForm");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("newTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      <div className="mt-4">
        <ProductForm />
      </div>
    </MaxWidthWrapper>
  );
};

export default NewProduct;
