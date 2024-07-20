import { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import QuotationForm from "@/components/quotation/quotation-form";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";

type Props = {
  params: { locale: string; id: string };
};

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
        items: {
          include: {
            product: true;
          };
        };
        participants: true;
      };
    };
    items: {
      include: {
        product: true;
        rfqItem: true;
      };
    };
  };
}>;

const getQuotation = async (id: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<QuotationType>(`/api/quotation/${id}`, {
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

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("updateQuotationTitle", { id }),
    description: t("updateQuotationDescription"),
  };
};

const EditQuotation = async ({ params: { id } }: Props) => {
  const quotation = await getQuotation(id);
  if (
    !quotation ||
    !quotation.rfq.latestVersion ||
    new Date(quotation.rfq.endDate) < new Date()
  )
    return notFound();

  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) return notFound();

  if (company.id !== quotation.companyId) return notFound();

  const t = await getTranslations("QuotationForm");

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("updateTitle", { id })}
        </h1>
        <p className="text-lg text-muted-foreground">{t("updateSubtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:gap-4">
        <div className="col-span-8 space-y-6 mt-4 lg:mt-0">
          <QuotationForm
            quotation={quotation}
            rfq={quotation.rfq}
            currentCompany={company}
          />
        </div>
        <div className="order-first col-span-4 space-y-6 lg:order-none">
          <RFQMainInfo rfq={quotation.rfq} displayRfqLink={true} />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default EditQuotation;
