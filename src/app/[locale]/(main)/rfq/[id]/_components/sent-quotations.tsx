import { headers, cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import QuotationCard from "@/components/quotation/quotation-card";
import PaginationBar from "@/components/ui/pagination-bar";

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
  rfqId: string;
  page: number;
};

async function getRFQQuotations(rfqId: string, page: number) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/quotation?rfqId=${rfqId}&page=${page}&limit=10`,
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

const SentQuotations = async ({ rfqId, page }: SentQuotationsProps) => {
  const data = await getRFQQuotations(rfqId, page);
  if (!data) return null;

  const t = await getTranslations("RFQ");

  const { result, pagination } = data;

  return (
    <>
      <div className="space-y-3 mt-4">
        {result.map((quotation) => {
          return <QuotationCard key={quotation.id} quotation={quotation} />;
        })}
      </div>
      <PaginationBar href={`/rfq/${rfqId}?page=`} pagination={pagination} />
    </>
  );
};

export default SentQuotations;
