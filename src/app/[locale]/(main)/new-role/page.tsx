import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type {
  Stock as StockType,
  PriceType as PriceTypeType,
} from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import EditRole from "@/components/role/edit-role";
import { getStocksAndPriceTypes } from "@/app/actions/get-stocks-price-types";
import getCurrentCompany from "@/app/actions/get-current-company";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getCurrentCompany();
  if (!company)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("newRoleTitle", { companyName: company.name }),
    description: t("newRoleDescription"),
  };
};

const NewRole = async () => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const result = await getStocksAndPriceTypes();
  const emptyStocks: StockType[] = [];
  const stocks = result ? result[0].result : emptyStocks;
  const emptyPriceTypes: PriceTypeType[] = [];
  const priceTypes = result ? result[1].result : emptyPriceTypes;

  const t = await getTranslations("Role");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2 mb-4">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("newRoleTitle", { companyName: company.name })}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newRoleSubtitle")}</p>
      </div>
      <EditRole company={company} stocks={stocks} priceTypes={priceTypes} />
    </MaxWidthWrapper>
  );
};

export default NewRole;
