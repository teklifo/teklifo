import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type {
  Stock as StockType,
  PriceType as PriceTypeType,
} from "@prisma/client";
import RFQForm from "@/app/[locale]/(main)/_components/rfq/rqf-form";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { getStocksAndPriceTypes } from "@/app/actions/get-stocks-price-types";
import getCurrentCompany from "@/app/actions/get-current-company";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("newRFQTitle"),
    description: t("newRFQDescription"),
  };
};

const NewRFQ = async () => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const t = await getTranslations("RFQForm");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("newRFQTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newRFQSubtitle")}</p>
      </div>
      <RFQForm />
    </MaxWidthWrapper>
  );
};

export default NewRFQ;
