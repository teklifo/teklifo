import { headers, cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import QuotationModal from "@/components/quotation/quotation-modal";
import QuotationCard from "@/components/quotation/quotation-card";
import PaginationBar from "@/components/ui/pagination-bar";
import getCurrentCompany from "@/app/actions/get-current-company";

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
  const data = await getRFQQuotations(rfq.id, page);
  if (!data) return null;

  const { result, pagination } = data;

  const currentCompany = await getCurrentCompany();
  if (!currentCompany) return;

  return (
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
              <QuotationCard
                currentCompany={currentCompany}
                quotation={quotation}
              />
            </QuotationModal>
          );
        })}
      </div>
      <PaginationBar href={`/rfq/${rfq.id}?page=`} pagination={pagination} />
    </>
  );
};

export default SentQuotations;
