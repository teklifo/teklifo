import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { Briefcase, FileText, Package } from "lucide-react";
import RFQActions from "./_components/rfq-actions";
import RFQData from "./_components/rfq-data";
import RFQItemCard from "./_components/rfq-item-card";
import SentQuotations from "./_components/sent-quotations";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import CompanyAvatar from "@/components/company/company-avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";

type Props = {
  params: { locale: string; id: string };
  searchParams: {
    page?: number;
  };
};

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const rfq = await getRFQ(id);
  if (!rfq)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  const { description } = rfq;

  return {
    title: `${rfq.title} | ${t("projectName")}`,
    description,
  };
};

const RFQ = async ({ params: { id }, searchParams: { page } }: Props) => {
  const t = await getTranslations("RFQ");
  const format = await getFormatter();

  const rfq = await getRFQ(id);

  if (!rfq) {
    const rfqPreview = await getRFQPreview(id);
    if (rfqPreview) {
      redirect(`/supplier-guide/${rfqPreview.id}`);
    }

    return notFound();
  }

  const { title, number, currency, items } = rfq;

  return (
    <MaxWidthWrapper className="mt-8 mb-20">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {`${t("rfqNumber")}: ${number}`}
        </p>
      </div>
      <div className="grid grid-cols-1 mt-6 gap-0 gap-y-6 lg:grid-cols-12 lg:gap-4">
        <div className="col-span-8 space-y-6 mt-4 order-2 lg:order-1 lg:mt-0">
          <RFQMainInfo rfq={rfq} />
          <Tabs
            defaultValue={(page ?? 0) > 1 ? "quotations" : "main"}
            className="mt-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="main" className="space-x-2">
                <FileText className="w-4 h-4" />
                <span className="hidden md:block">{t("main")}</span>
              </TabsTrigger>
              <TabsTrigger value="items" className="space-x-2">
                <Package className="w-4 h-4" />
                <span className="hidden md:block">{`${t("items")} (${
                  items.length || 0
                })`}</span>
              </TabsTrigger>
              <TabsTrigger value="quotations" className="space-x-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden md:block">{t("quotations")}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="main">
              <RFQData rfq={rfq} />
            </TabsContent>
            <TabsContent value="items">
              <div className="space-y-4 mt-4">
                {items.map((item, index) => (
                  <RFQItemCard
                    key={index}
                    number={index + 1}
                    currency={currency}
                    item={item}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="quotations">
              <SentQuotations rfq={rfq} page={page ?? 1} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="col-span-4 relative order-1 lg:order-2">
          <div className="sticky top-0 p-2 space-y-4">
            <CompanyAvatar
              company={rfq.company}
              className="flex flex-col justify-center items-center"
            />
            <RFQActions rfq={rfq} />
            <p className="text-center text-sm text-muted-foreground">
              {`${t("updatedAt")}: ${format.relativeTime(
                new Date(rfq.createdAt)
              )}`}
            </p>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default RFQ;
