"use client";
import "react-phone-number-input/style.css";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import type { Value } from "react-phone-number-input";
import { BriefcaseBusiness } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import QuotationFormContatcs from "./quotation-form-contacts";
import QuotationItemsTable from "./quotation-form-items-table";
import QuotationFormAdditional from "./quotation-form-additional";
import ConfirmQuotation from "./confirm-quotation";
import { getQuotationSchema } from "@/lib/schemas";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationFormProps = {
  rfq: RFQType;
  quotation?: QuotationType;
  currentCompany: CompanyType;
};

const QuotationForm = ({
  rfq,
  quotation,
  currentCompany,
}: QuotationFormProps) => {
  const t = useTranslations("QuotationForm");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      id: quotation?.id ?? 0,
      rfqVersionId: rfq.versionId ?? "",
      rfqId: rfq.id ?? "",
      currency: quotation?.currency ?? rfq.currency,
      contactPerson: quotation?.contactPerson ?? "",
      email: "",
      phone: "",
      description: quotation?.description ?? "",
      items: rfq.items.map((rfqItem) => {
        const quotationItem = quotation?.items.find(
          (quotationItem) => quotationItem.rfqItemId === rfqItem.id
        );
        return {
          id: quotationItem?.id ?? "",
          rfqItemVersionId: rfqItem.versionId,
          rfqItemId: rfqItem.id ?? "",
          productName: rfqItem.productName,
          productId: rfqItem.productId ?? 0,
          product: rfqItem.product ?? undefined,
          quantity: Number(quotationItem?.quantity ?? rfqItem.quantity),
          price: Number(quotationItem?.price ?? 0),
          amount: Number(quotationItem?.amount ?? 0),
          vatRate: quotationItem?.vatRate ?? "NOVAT",
          vatIncluded: quotationItem?.vatIncluded ?? false,
          deliveryDate: quotationItem?.deliveryDate ?? rfqItem.deliveryDate,
          comment: quotationItem?.comment ?? "",
          skip: quotationItem?.skip ?? false,
        };
      }),
    },
  });

  useEffect(() => {
    form.setValue("email", quotation ? quotation.email : currentCompany.email);
    form.setValue(
      "phone",
      (quotation ? quotation.phone : currentCompany.phone) as Value
    );
  }, [currentCompany.email, currentCompany.phone, form, quotation]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-center whitespace-normal h-auto space-x-2 lg:w-full">
          <BriefcaseBusiness />
          <span>{t("createQuotation")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 flex flex-col space-y-8 max-w-[100%] h-[100%] md:max-w-[90%] md:h-[95%] sm:p-6">
        <DialogHeader className="flex-initial">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex-auto p-4 space-y-10">
            <Tabs defaultValue="items" className="h-full">
              <TabsList className="max-w-max">
                <TabsTrigger value="items">{t("items")}</TabsTrigger>
                <TabsTrigger value="contacts">{t("contacts")}</TabsTrigger>
                <TabsTrigger value="additional">{t("additional")}</TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="h-full">
                <ScrollArea className="w-full min-h-full">
                  <QuotationItemsTable rfq={rfq} />
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="contacts">
                <QuotationFormContatcs />
              </TabsContent>
              <TabsContent value="additional">
                <QuotationFormAdditional />
              </TabsContent>
            </Tabs>
          </form>
          <DialogFooter className="px-6">
            <ConfirmQuotation rfq={rfq} quotation={quotation} />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationForm;
