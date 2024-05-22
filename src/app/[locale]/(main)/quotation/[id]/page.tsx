import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Package, Pencil } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { Link } from "@/navigation";
import DeleteQuotation from "./_components/delete-quotation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import QuotationMainInfo from "@/components/quotation/quotation-main-info";
import QuotationBase from "@/components/quotation/quotation-base";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany from "@/app/actions/get-current-company";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
import QuotationItem from "./_components/quotation-item";

type Props = {
  params: { locale: string; id: string };
};

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

async function getQuotation(id: string) {
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
}

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const quotation = await getQuotation(id);
  if (!quotation)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  const { description } = quotation;

  return {
    title: `${quotation.id} | ${t("projectName")}`,
    description,
  };
};

const Quotation = async ({ params: { id } }: Props) => {
  const t = await getTranslations("Quotation");

  const quotation = await getQuotation(id);
  if (!quotation) return notFound();

  const company = await getCurrentCompany();

  const isAdmin =
    company !== null ? company.users[0].companyRole.default : false;

  const companyOwnsQuotation = quotation.companyId === company?.id;

  const { description, items } = quotation;

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {`${t("quotation")} #${id}`}
        </h1>
        {companyOwnsQuotation && isAdmin && (
          <div className="flex space-x-2">
            <Link
              href={`/edit-rfq/${quotation.id}`}
              className={cn(
                "space-x-2",
                buttonVariants({ variant: "default" })
              )}
            >
              <Pencil className="h-4 w-4" />
              <span>{t("edit")}</span>
            </Link>
            <DeleteQuotation quotation={quotation} />
          </div>
        )}
      </div>
      <QuotationBase rfq={quotation.rfq} />
      <QuotationMainInfo quotation={quotation} />
      {description && (
        <div className="space-y-2">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t("description")}
          </h3>
          <div className="whitespace-pre-line">{description}</div>
        </div>
      )}
      <div className="flex flex-row items-center border-b pb-2 space-x-2">
        <Package className="w-8 h-8" />
        <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          {`${t("items")} (${items.length || 0})`}
        </h3>
      </div>
      {items.map((item, index) => (
        <div key={index} />
      ))}
    </MaxWidthWrapper>
  );
};

export default Quotation;
