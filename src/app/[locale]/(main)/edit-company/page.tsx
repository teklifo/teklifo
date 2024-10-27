import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import CompanyForm from "@/components/company/company-form";
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
    title: t("updateCompanyTitle"),
    description: t("updateCompanyDescription"),
  };
};

const EditCompany = async () => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const t = await getTranslations("CompanyForm");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("updateTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("updateSubtitle")}</p>
      </div>
      <div className="mt-4">
        <CompanyForm company={company} />
      </div>
    </MaxWidthWrapper>
  );
};

export default EditCompany;
