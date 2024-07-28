"use client";

import { useState } from "react";
import { Prisma, Company as CompanyType } from "@prisma/client";
import { BriefcaseBusiness } from "lucide-react";
import QuotationForm from "@/components/quotation/quotation-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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

type StartQuotationProps = {
  rfq: RequestForQuotationType;
  company: CompanyType;
};

const StartQuotation = ({ rfq, company }: StartQuotationProps) => {
  const t = useTranslations("RFQ");

  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-center whitespace-normal h-auto space-x-2 lg:w-full">
          <BriefcaseBusiness />
          <span>{t("createQuotation")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 flex flex-col space-y-8 max-w-[100%] h-[100%] md:max-w-[90%] md:h-[95%] sm:p-6">
        <DialogHeader className="flex-initial">
          <DialogTitle>{t("quotationTitle")}</DialogTitle>
          <DialogDescription>{t("quotationSubtitle")}</DialogDescription>
        </DialogHeader>
        <QuotationForm
          rfq={rfq}
          currentCompany={company}
          closeDialog={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StartQuotation;
