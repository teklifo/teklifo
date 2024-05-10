import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import {
  Pencil,
  Calendar,
  Lock,
  Globe,
  HelpCircle,
  CircleDollarSign,
  Building2,
  Fingerprint,
  Receipt,
} from "lucide-react";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQ from "@/app/actions/get-rfq";
import { cn } from "@/lib/utils";
import { RFQProductCard } from "./_components/rfq-product-card";
import DeleteRFQ from "./_components/delete-rfq";

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
    title: `${rfq.id} | ${t("projectName")}`,
    description,
  };
};

const RFQ = async ({ params: { id } }: Props) => {
  const t = await getTranslations("RFQ");

  const rfq = await getRFQ(id);
  if (!rfq) return notFound();

  const company = await getCurrentCompany();

  const isAdmin =
    company !== null ? company.users[0].companyRole.default : false;

  const companyOwnsRFQ = rfq.companyId === company?.id;
  const companyIsParticipant =
    rfq.participants.find((e) => e.companyId === company?.id) !== undefined;

  if (!companyOwnsRFQ && !rfq.publicRequest && !companyIsParticipant) {
    redirect(`/supplier-guide/${rfq.id}`);
  }

  const {
    number,
    description,
    startDate,
    endDate,
    publicRequest,
    currency,
    products,
    paymentTerms,
    deliveryAddress,
    deliveryTerms,
  } = rfq;

  return (
    <MaxWidthWrapper className="my-8 space-y-6">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight">{`${t(
          "rfq"
        )} #${number}`}</h1>
        {companyOwnsRFQ && isAdmin && (
          <div className="flex space-x-2">
            <Link
              href={`/edit-rfq/${rfq.id}`}
              className={cn(
                "space-x-2",
                buttonVariants({ variant: "default" })
              )}
            >
              <Pencil className="h-4 w-4" />
              <span>{t("edit")}</span>
            </Link>
            <DeleteRFQ rfq={rfq} />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex flex-row items-end space-x-2">
          <Building2 />
          <span className="font-semibold">{`${t("company")}:`}</span>
          <Link
            href={`/company/${rfq.companyId}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {rfq.company?.name}
          </Link>
        </div>
        <div className="flex flex-row items-end space-x-2">
          <Fingerprint />
          <span className="font-semibold">{`${t("tin")}:`}</span>
          <span>{rfq.company?.tin}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-row w-auto space-x-2">
          {publicRequest ? (
            <>
              <Globe />
              <span className="font-semibold">{t("public")}</span>
            </>
          ) : (
            <>
              <Lock />
              <span className="font-semibold">{t("private")}</span>
            </>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{publicRequest ? t("publicHint") : t("privateHint")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-row space-x-2">
          <Calendar />
          <span className="font-semibold">{`${t("date")}:`}</span>
          <span>
            {`${format(startDate, "dd.MM.yyyy")} - ${format(
              endDate,
              "dd.MM.yyyy"
            )}`}
          </span>
        </div>
        <div className="flex flex-row space-x-2">
          <CircleDollarSign />
          <span className="font-semibold">{`${t("currency")}:`}</span>
          <span>{currency}</span>
        </div>
      </div>
      {description && (
        <div>
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t("description")}
          </h3>
          <div className="whitespace-pre-line">{description}</div>
        </div>
      )}
      <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        {`${t("products")} (${products.length || 0})`}
      </h3>
      {products.map((product, index) => (
        <RFQProductCard
          key={index}
          number={index + 1}
          currency={currency}
          product={product}
        />
      ))}
      {(paymentTerms || deliveryTerms || deliveryAddress) && (
        <>
          <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {t("additional")}
          </h3>
          {paymentTerms && (
            <div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("paymentTerms")}
              </h4>
              <p className="whitespace-pre-line">{paymentTerms}</p>
            </div>
          )}
          {deliveryTerms && (
            <div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("deliveryTerms")}
              </h4>
              <p className="whitespace-pre-line">{deliveryTerms}</p>
            </div>
          )}
          {deliveryAddress && (
            <div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("deliveryAddress")}
              </h4>
              <p className="whitespace-pre-line">{deliveryAddress}</p>
            </div>
          )}
        </>
      )}
      {companyIsParticipant && (
        <div className="sticky bottom-8 flex justify-center">
          <Link
            href={`/new-quotation/${id}`}
            className={cn(
              "space-x-2",
              buttonVariants({ variant: "default", size: "lg" })
            )}
          >
            <Receipt />
            <span>{t("createQuotation")}</span>
          </Link>
        </div>
      )}
    </MaxWidthWrapper>
  );
};

export default RFQ;
