import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";
import { localizedRelativeDate } from "@/lib/utils";
import RFQActions from "./_components/rfq-actions";
import RFQItemCard from "./_components/rfq-item-card";
import SentQuotations from "./_components/sent-quotations";

type Props = {
  params: { locale: string; id: string };
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

const RFQ = async ({ params: { id } }: Props) => {
  const t = await getTranslations("RFQ");

  const locale = useLocale();

  const rfq = await getRFQ(id);

  if (!rfq) {
    const rfqPreview = await getRFQPreview(id);
    if (rfqPreview) {
      redirect(`/supplier-guide/${rfqPreview.id}`);
    }

    return notFound();
  }

  const {
    title,
    number,
    description,
    currency,
    items,
    paymentTerms,
    deliveryAddress,
    deliveryTerms,
  } = rfq;

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {`${t("rfq")} #${number}`}
        </p>
      </div>
      <div className="grid grid-cols-1 mt-6 gap-0 gap-y-6 lg:grid-cols-12 lg:gap-4">
        <div className="col-span-8 space-y-6 mt-4 lg:mt-0">
          <RFQMainInfo rfq={rfq} displayRfqLink={false} />
        </div>
        <div className="col-span-4 space-y-2">
          <RFQActions rfq={rfq} />
          <p className="text-center text-sm text-muted-foreground">
            {`${t("updatedAt")}: ${localizedRelativeDate(
              new Date(rfq.createdAt),
              new Date(),
              locale
            )}`}
          </p>
        </div>
      </div>
      <Tabs defaultValue="main" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main">{t("main")}</TabsTrigger>
          <TabsTrigger value="items">
            {`${t("items")} (${items.length || 0})`}
          </TabsTrigger>
          <TabsTrigger value="quotations">{t("quotations")}</TabsTrigger>
        </TabsList>
        <TabsContent value="main">
          {(paymentTerms || deliveryTerms || deliveryAddress) && (
            <div className="space-y-4">
              {description && (
                <div className="space-y-2">
                  <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    {t("description")}
                  </h3>
                  <div className="whitespace-pre-line">{description}</div>
                </div>
              )}
              {paymentTerms && (
                <div className="space-y-2">
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    {t("paymentTerms")}
                  </h4>
                  <p className="whitespace-pre-line">{paymentTerms}</p>
                </div>
              )}
              {deliveryTerms && (
                <div className="space-y-2">
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    {t("deliveryTerms")}
                  </h4>
                  <p className="whitespace-pre-line">{deliveryTerms}</p>
                </div>
              )}
              {deliveryAddress && (
                <div className="space-y-2">
                  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                    {t("deliveryAddress")}
                  </h4>
                  <p className="whitespace-pre-line">{deliveryAddress}</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="items">
          <div className="space-y-4">
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
          <SentQuotations rfqId={rfq.id} rfqVersionId={rfq.versionId} />
        </TabsContent>
      </Tabs>
    </MaxWidthWrapper>
  );
};

export default RFQ;
