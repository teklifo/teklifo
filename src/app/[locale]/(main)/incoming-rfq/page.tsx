import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { FileInput, Plus } from "lucide-react";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQCard from "@/components/rfq/rfq-card";
import PaginationBar from "@/components/ui/pagination-bar";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { PaginationType } from "@/types";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
  };
}>;

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: RequestForQuotationType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("incomingRfqTitle"),
    description: t("incomingRfqDescription"),
  };
};

const getIncomingRFQ = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/rfq?participantId=${companyId}&page=${page}&limit=10`,
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

const IncomingRFQ = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const data = await getIncomingRFQ(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("IncomingRFQ");

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
            {result.map((rfq) => (
              <RFQCard key={rfq.id} rfq={rfq} currentCompany={company} />
            ))}
          </div>
        ) : (
          <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
            <FileInput className="w-48 h-48" />
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("noIncomingRFQ")}
            </h2>
          </div>
        )}
        <PaginationBar href={`/outgoing-rfq?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

async function NewRFQLink() {
  const t = await getTranslations("IncomingRFQ");

  return (
    <Link
      href={`/new-rqf`}
      className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
    >
      <Plus />
      <span>{t("new")}</span>
    </Link>
  );
}

export default IncomingRFQ;
