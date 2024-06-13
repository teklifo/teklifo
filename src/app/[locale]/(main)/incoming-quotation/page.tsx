import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import QuotationCard from "@/components/quotation/quotation-card";
import PaginationBar from "@/components/ui/pagination-bar";
import getCurrentCompany from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
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

type PaginatedData = {
  result: QuotationType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("incomingQuotationTitle"),
    description: t("incomingQuotationDescription"),
  };
};

const getIncomingQuotations = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/quotation?rfqCompanyId=${companyId}&page=${page}&limit=10`,
      {
        headers: {
          "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
          Cookie: cookie,
        },
        next: { revalidate: 0 },
      }
    );
  } catch (error) {
    return undefined;
  }
};

const IncomingQuotation = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const data = await getIncomingQuotations(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("IncomingQuotations");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="mt-4">
        {result.length > 0 ? (
          <div className="flex flex-col space-y-3 pt-4">
            {result.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                quotation={quotation}
                currentCompany={company}
              />
            ))}
          </div>
        ) : (
          <div className="my-8 flex flex-col justify-center items-center space-y-4 text-center">
            <Image
              src="/illustrations/not-found-alt.svg"
              alt="No incoming quotations"
              priority
              width="600"
              height="600"
            />
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("noIncomingQuotation")}
            </h2>
          </div>
        )}
        <PaginationBar
          href={`/incoming-quotation?page=`}
          pagination={pagination}
        />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default IncomingQuotation;