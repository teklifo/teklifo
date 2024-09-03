import { headers, cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import QuotationModal from "@/components/quotation/quotation-modal";
import QuotationCard from "@/components/quotation/quotation-card";
import PaginationBar from "@/components/ui/pagination-bar";
import getCurrentCompany from "@/app/actions/get-current-company";
import ThemedImage from "@/components/themed-image";
import { getTranslations } from "next-intl/server";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
    items: {
      include: {
        product: true;
      };
    };
    participants: true;
  };
}>;

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
  };
}>;

type PaginatedData = {
  result: QuotationType[];
  pagination: PaginationType;
};

type SentQuotationsProps = {
  rfq: RequestForQuotationType;
  page: number;
};

async function getRFQQuotations(rfqId: string, page: number) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/quotation?rfqId=${rfqId}&onlyRelevant=false&page=${page}&limit=10`,
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
}

const SentQuotations = async ({ rfq, page }: SentQuotationsProps) => {
  const t = await getTranslations("RFQ");

  const data = await getRFQQuotations(rfq.id, page);
  if (!data) return null;

  const { result, pagination } = data;

  const currentCompany = await getCurrentCompany();
  if (!currentCompany) return;

  return result.length > 0 ? (
    <>
      <div className="flex flex-col space-y-3 mt-4">
        {result.map((quotation) => {
          return (
            <QuotationModal
              key={quotation.id}
              currentCompany={currentCompany}
              rfq={rfq}
              quotation={quotation}
            >
              <QuotationCard quotation={quotation} />
            </QuotationModal>
          );
        })}
      </div>
      <PaginationBar href={`/rfq/${rfq.id}?page=`} pagination={pagination} />
    </>
  ) : (
    <div className="flex flex-col justify-center items-center py-2 space-y-4">
      <ThemedImage
        src={`/illustrations/light/documents.svg`}
        alt="No quotations"
        priority
        width={200}
        height={200}
      />
      <p className="leading-7 tracking-tight max-w-sm text-muted-foreground">
        {t("noQuotations")}
      </p>
    </div>
  );
};

export default SentQuotations;
