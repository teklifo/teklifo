import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import CompanyForm from "@/app/[locale]/(main)/_components/company-form";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import getAllowedCompany from "@/app/actions/get-allowed-company";
import getCompanyId from "@/lib/get-company-id";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const id = getCompanyId();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getAllowedCompany(id);
  if (!company)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("updateCompanyTitle", { companyName: company.name }),
    description: t("updateCompanyDescription"),
  };
};

const EditCompany = async () => {
  const id = getCompanyId();
  const company = await getAllowedCompany(id);
  if (!company) return notFound();

  const t = await getTranslations("CompanyForm");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
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
