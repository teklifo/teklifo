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
import EditRole from "@/app/[locale]/(main)/roles/_components/edit-role";
import request from "@/lib/request";
import { getStocksAndPriceTypes } from "@/app/actions/get-stocks-price-types";
import getCompanyId from "@/lib/get-company-id";

type Props = {
  params: { locale: string; roleId: string };
};

type RoleType = Prisma.CompanyRoleGetPayload<{
  include: { availableData: true; company: true };
}>;

export const generateMetadata = async ({
  params: { locale, roleId },
}: Props): Promise<Metadata> => {
  const id = getCompanyId();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const role = await getRole(id, roleId);

  if (!role)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("editRoleTitle", {
      roleName: role.name,
      companyName: role.company.name,
    }),
    description: t("editRoleDescription"),
  };
};

const getRole = async (id: string, roleId: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<RoleType>(`/api/company/${id}/role/${roleId}`, {
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
  const id = getCompanyId();
  const role = await getRole(id, roleId);
  if (!role) return notFound();

  const result = await getStocksAndPriceTypes(id);
  const emptyStocks: StockType[] = [];
  const stocks = result ? result[0].result : emptyStocks;
  const emptyPriceTypes: PriceTypeType[] = [];
  const priceTypes = result ? result[1].result : emptyPriceTypes;

  const t = await getTranslations("Role");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("updateRoleTitle", {
            roleName: role.name,
            companyName: role.company.name,
          })}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("updateRoleSubtitle")}
        </p>
      </div>
      <EditRole
        companyId={id}
        role={role}
        stocks={stocks}
        priceTypes={priceTypes}
      />
    </MaxWidthWrapper>
  );
};

export default UpdateForm;
