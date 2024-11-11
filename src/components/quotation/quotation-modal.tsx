"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import QuotationView from "./quotation-view";
import QuotationEditForm from "./quotation-form/quotation-edit-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: {
      select: {
        id: true;
        name: true;
      };
    };
    items: {
      include: {
        product: true;
      };
    };
    participants: true;
  };
}>;

type QuotationType = Prisma.QuotationGetPayload<{
  select: {
    id: true;
    company: {
      select: {
        id: true;
      };
    };
    rfq: {
      select: {
        latestVersion: true;
      };
    };
  };
}>;

type QuotationModalProps = {
  rfq?: RequestForQuotationType;
  quotation: QuotationType;
  currentCompany?: CompanyType;
  children: React.ReactNode;
};

const QuotationModal = ({
  rfq,
  quotation,
  currentCompany,
  children,
}: QuotationModalProps) => {
  const t = useTranslations("Quotation");

  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  const { company } = quotation;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="mt-0 px-0 flex flex-col max-w-[100vw] h-[100vh] md:max-w-[90vw] md:h-[95vh] sm:p-6">
        {currentCompany?.id === company.id &&
        rfq &&
        quotation.rfq.latestVersion ? (
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

export default QuotationModal;
