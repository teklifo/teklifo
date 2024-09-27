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
import EditRole from "@/components/role/edit-role";
import getCurrentCompany from "@/app/actions/get-current-company";
import { getStocksAndPriceTypes } from "@/app/actions/get-stocks-price-types";
import request from "@/lib/request";

type Props = {
  params: { locale: string; roleId: string };
};

type RoleType = Prisma.CompanyRoleGetPayload<{
  include: { availableData: true; company: true };
}>;

export const generateMetadata = async ({
  params: { locale, roleId },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getCurrentCompany();
  if (!company)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  const role = await getRole(company.id, roleId);
  if (!role)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: role.name,
    description: t("editRoleDescription"),
  };
};

const getRole = async (companyId: string, roleId: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<RoleType>(`/api/company/${companyId}/role/${roleId}`, {
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

const UpdateForm = async ({ params: { roleId } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const role = await getRole(company.id, roleId);
  if (!role) return notFound();

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
          {t("updateRoleTitle", {
            roleName: role.name,
          })}
        </h1>

        <p className="text-lg text-muted-foreground">
          {t("updateRoleSubtitle")}
        </p>
      </div>
      <EditRole
        role={role}
        company={company}
        stocks={stocks}
        priceTypes={priceTypes}
      />
    </MaxWidthWrapper>
  );
};

export default UpdateForm;
