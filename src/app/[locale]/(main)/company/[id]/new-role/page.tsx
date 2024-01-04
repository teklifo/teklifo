import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type {
  Prisma,
  Stock as StockType,
  PriceType as PriceTypeType,
} from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import EditRole from "@/components/roles/edit-role";
import request from "@/lib/request";
import { getStocksAndPriceTypes } from "@/app/actions/get-stocks-price-types";

type CompanyType = Prisma.CompanyGetPayload<{
  include: { users: true };
}>;

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
    title: t("newRoleTitle", { companyName: company.name }),
    description: t("newRoleDescription"),
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

const NewRole = async ({ params: { id } }: Props) => {
  const company = await getCompany(id);
  if (!company) return notFound();

  const result = await getStocksAndPriceTypes(id);
  const emptyStocks: StockType[] = [];
  const stocks = result ? result[0].result : emptyStocks;
  const emptyPriceTypes: PriceTypeType[] = [];
  const priceTypes = result ? result[1].result : emptyPriceTypes;

  const t = await getTranslations("Role");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2 mb-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("newRoleTitle", { companyName: company.name })}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newRoleSubtitle")}</p>
      </div>
      <EditRole companyId={id} stocks={stocks} priceTypes={priceTypes} />
    </MaxWidthWrapper>
  );
};

export default NewRole;
