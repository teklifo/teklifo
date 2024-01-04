import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Company as CompanyType } from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import CompanyForm from "@/components/company/company-form";
import request from "@/lib/request";

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getCompany(id);
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

const getCompany = async (id: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<CompanyType>(`/api/company/${id}`, {
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

const EditCompany = async ({ params: { id } }: Props) => {
  const company = await getCompany(id);
  if (!company) return notFound();

  const t = await getTranslations("CompanyForm");

  return (
    <MaxWidthWrapper>
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
