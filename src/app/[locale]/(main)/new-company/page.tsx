import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CompanyForm from "@/app/[locale]/(main)/_components/company-form";
import MaxWidthWrapper from "@/components/max-width-wrapper";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("newCompanyTitle"),
    description: t("newCompanyDescription"),
  };
};

const NewCompany = async () => {
  const t = await getTranslations("CompanyForm");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("createTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("updateSubtitle")}</p>
      </div>
      <div className="mt-4">
        <CompanyForm />
      </div>
    </MaxWidthWrapper>
  );
};

export default NewCompany;
