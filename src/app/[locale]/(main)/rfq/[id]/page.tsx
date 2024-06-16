import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Package, Pencil, ArrowRightCircle } from "lucide-react";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQMainInfo from "@/components/rfq/rfq-main-info";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";
import getRFQPreview from "@/app/actions/get-rfq-preview";
import { cn } from "@/lib/utils";
import RFQItemCard from "./_components/rfq-item-card";
import DeleteRFQ from "./_components/delete-rfq";
import ShareRFQ from "./_components/share-rfq";

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

  const rfq = await getRFQ(id);
  if (!rfq) {
    const rfqPreview = await getRFQPreview(id);
    if (rfqPreview) {
      redirect(`/supplier-guide/${rfqPreview.id}`);
    }

    return notFound();
  }

  const company = await getCurrentCompany();

  const isAdmin =
    company !== null ? company.users[0].companyRole.default : false;

  const companyIsRequester = rfq.companyId === company?.id;
  const companyIsParticipant =
    rfq.participants.find(
      (participant) => participant.companyId === company?.id
    ) !== undefined;

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

  const completed = new Date(rfq.endDate) < new Date();

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground">{`${t(
            "rfq"
          )} #${number}`}</p>
        </div>
        {companyIsRequester && isAdmin && (
          <div className="flex space-x-2">
            {!completed && (
              <Link
                href={`/edit-rfq/${rfq.id}`}
                className={cn(
                  "space-x-2",
                  buttonVariants({ variant: "outline" })
                )}
              >
                <Pencil className="h-4 w-4" />
                <span>{t("edit")}</span>
              </Link>
            )}
            <DeleteRFQ rfq={rfq} />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-12 lg:gap-4">
        <div className="col-span-8 space-y-6 mt-4 lg:mt-0">
          {description && (
            <div className="space-y-2">
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("description")}
              </h3>
              <div className="whitespace-pre-line">{description}</div>
            </div>
          )}
          <div className="flex flex-row items-center border-b pb-2 space-x-2">
            <Package className="w-8 h-8" />
            <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
              {`${t("items")} (${items.length || 0})`}
            </h3>
          </div>
          {items.map((item, index) => (
            <RFQItemCard
              key={index}
              number={index + 1}
              currency={currency}
              item={item}
            />
          ))}
          {(paymentTerms || deliveryTerms || deliveryAddress) && (
            <>
              <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                {t("additional")}
              </h3>
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
            </>
          )}
        </div>
        <div className="order-first col-span-4 space-y-6 lg:order-none">
          <RFQMainInfo rfq={rfq} />
          {companyIsParticipant && !completed && (
            <div className="absolute m-auto left-0 right-0 bottom-8 flex justify-center lg:bottom-0 lg:relative">
              <Link
                href={`/new-quotation/${id}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "text-center whitespace-normal h-auto space-x-2 lg:w-full"
                )}
              >
                <ArrowRightCircle />
                <span>{t("createQuotation")}</span>
              </Link>
            </div>
          )}
          {companyIsRequester && (
            <div className="absolute m-auto left-0 right-0 bottom-8 flex justify-center lg:bottom-0 lg:relative">
              <ShareRFQ />
            </div>
          )}
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default RFQ;
