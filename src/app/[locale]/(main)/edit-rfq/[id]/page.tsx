import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQForm from "@/components/rfq/rfq-form.tsx";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getCurrentCompany();
  const rfq = await getRFQById(id);

  if (
    !company ||
    !rfq ||
    company.id !== rfq.companyId ||
    !company.users[0].companyRole.default
  ) {
    return {
      title: `${t("projectName")}`,
      description: "",
    };
  }

  return {
    title: t("updateRFQTitle", { number: rfq.number }),
    description: t("updateRFQDescription"),
  };
};

async function getRFQById(rfqId: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<RFQType>(`/api/rfq/${rfqId}`, {
      headers: {
        "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
        Cookie: cookie,
      },
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
}

const EditRFQ = async ({ params: { id } }: Props) => {
  const rfq = await getRFQById(id);
  if (!rfq || new Date(rfq.endDate) < new Date()) return notFound();

  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) return notFound();

  if (company.id !== rfq.companyId) return notFound();

  const t = await getTranslations("RFQForm");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("updateTitle", { number: rfq.number })}
        </h1>
        <p className="text-lg text-muted-foreground">{t("updateSubtitle")}</p>
      </div>
      <div className="mt-4">
        <RFQForm rfq={rfq} currentCompany={company} />
      </div>
    </MaxWidthWrapper>
  );
};

export default EditRFQ;
