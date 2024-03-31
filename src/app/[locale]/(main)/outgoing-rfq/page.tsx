import { Metadata } from "next";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { RequestForQuotation as RequestForQuotationType } from "@prisma/client";
import { Plus } from "lucide-react";
import RFQCard from "../_components/rfq-card";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PaginationBar from "@/components/ui/pagination-bar";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { PaginationType } from "@/types";

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
    title: t("outgoingRfqTitle"),
    description: t("outgoingRfqDescription"),
  };
};

const getCompanyRFQ = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/rfq?companyId=${companyId}&page=${page}&limit=10`,
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

const OutgoingRFQ = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyRFQ(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("OutgoingRFQ");

  return (
    <MaxWidthWrapper className="mb-8">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        {isAdmin && <NewRFQLink />}
      </div>
      <div className="mt-4">
        {result.length > 0 ? (
          <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2 lg:grid-cols-3">
            {result.map((rfq) => (
              <RFQCard key={rfq.id} rfq={rfq} />
            ))}
          </div>
        ) : (
          <div className="my-8 flex flex-col justify-center items-center space-y-4 text-center">
            <Image
              src="/illustrations/not-found-alt.svg"
              alt="No outgoing RFQs"
              priority
              width="600"
              height="600"
              className="mb-4"
            />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
              {t("noOutgoingRFQ")}
            </h2>
            {isAdmin && (
              <>
                <span className="block text-xl text-muted-foreground">
                  {t("noOutgoingRFQHint")}
                </span>
                <NewRFQLink />
              </>
            )}
          </div>
        )}
        <PaginationBar href={`/outgoing-rfq?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

async function NewRFQLink() {
  const t = await getTranslations("OutgoingRFQ");

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

export default OutgoingRFQ;
