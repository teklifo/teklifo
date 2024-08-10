"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import QuotationView from "./quotation-view";
import QuotationEditForm from "./quotation-form/quotation-edit-form";
import { QuotationOutdated, QuotationTotal } from "./quotation-main-info";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getAvatarFallback, localizedRelativeDate } from "@/lib/utils";

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

type QuotationCardProps = {
  rfq: RequestForQuotationType;
  quotation: QuotationType;
  currentCompany?: CompanyType;
};

const QuotationCard = ({
  rfq,
  quotation,
  currentCompany,
}: QuotationCardProps) => {
  const t = useTranslations("Quotation");

  const locale = useLocale();

  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  const { company, updatedAt } = quotation;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card
          className={cn(
            "cursor-pointer md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted",
            !quotation.rfq.latestVersion && "text-muted-foreground"
          )}
        >
          <div className="px-2">
            <CardHeader>
              <QuotationOutdated
                rfq={quotation.rfq}
                currentCompanyId={currentCompany?.id}
                className="mb-2"
              />
              <div className="flex flex-row justify-start items-center space-x-4">
                <Avatar className="md:h-20 md:w-20">
                  <AvatarFallback>
                    {getAvatarFallback(company.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{company.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
              <QuotationTotal quotation={quotation} view="horizontal" />
              <CardDescription>
                {`${t("updatedAt")}: ${localizedRelativeDate(
                  new Date(updatedAt),
                  new Date(),
                  locale
                )}`}
              </CardDescription>
            </CardContent>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="mt-0 px-0 flex flex-col max-w-[100%] h-[100%] md:max-w-[90%] md:h-[95%] sm:p-6">
        {currentCompany?.id === company.id && quotation.rfq.latestVersion ? (
          <>
            <DialogHeader className="flex-initial">
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("subtitle")}</DialogDescription>
            </DialogHeader>
            <QuotationEditForm
              currentCompany={currentCompany}
              rfq={rfq}
              quotationId={quotation.id}
              closeDialog={closeDialog}
            />
          </>
        ) : (
          <>
            <DialogHeader className="flex-initial">
              <DialogTitle>{t("viewTitle")}</DialogTitle>
              <DialogDescription>{t("viewSubtitle")}</DialogDescription>
            </DialogHeader>
            <QuotationView quotationId={quotation.id} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuotationCard;
