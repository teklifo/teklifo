import { headers, cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { Link } from "@/navigation";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
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

type SentQuotationsProps = {
  rfqId: string;
  rfqVersionId: string;
};

async function getRFQQuotations(rfqId: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/quotation?rfqId=${rfqId}&page=1&limit=999`,
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

const SentQuotations = async ({ rfqId, rfqVersionId }: SentQuotationsProps) => {
  const data = await getRFQQuotations(rfqId);
  if (!data) return null;

  const t = await getTranslations("RFQ");

  const { result } = data;

  return (
    <div>
      {result.length > 0 ? (
        <div className="">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("sentQuotations")}:`}
          </h3>
          <ul className="ml-5 flex flex-col space-y-2 list-disc [&>li]:mt-2">
            {result.map((quotation) => {
              const outdated = quotation.rfqVersionId !== rfqVersionId;
              return (
                <li key={quotation.id}>
                  <Link
                    href={`/quotation/${quotation.id}`}
                    target="_blank"
                    className={cn(
                      "scroll-m-20 underline text-lg font-semibold tracking-tight break-all",
                      outdated && "text-destructive"
                    )}
                  >
                    {t(
                      outdated
                        ? "sentOutdatedQuotationTitle"
                        : "sentQuotationTitle",
                      {
                        id: quotation.id,
                        amount: Number(quotation.totalAmount).toFixed(2),
                        currency: quotation.currency,
                      }
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="">No data</div>
      )}
    </div>
  );
};

export default SentQuotations;
