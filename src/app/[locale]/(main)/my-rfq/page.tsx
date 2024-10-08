import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FileInput, Plus } from "lucide-react";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQCard from "@/components/rfq/rfq-card";
import PaginationBar from "@/components/ui/pagination-bar";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { PaginationType, RFQWithQuotationsType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: RFQWithQuotationsType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("myRFQTitle"),
    description: t("myRFQDescription"),
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

const MyRFQ = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyRFQ(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("MyRFQ");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        {isAdmin && <NewRFQLink />}
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
            <FileInput className="w-48 h-48 text-foreground" />
            <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("noMyRFQ")}
            </h2>
            {isAdmin && (
              <>
                <span className="leading-7 tracking-tight max-w-sm text-muted-foreground">
                  {t("noMyRFQHint")}
                </span>
                <NewRFQLink />
              </>
            )}
          </div>
        )}
        <PaginationBar href={`/my-rfq?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

async function NewRFQLink() {
  const t = await getTranslations("MyRFQ");

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

export default MyRFQ;
