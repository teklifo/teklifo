"use client";
import "react-phone-number-input/style.css";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Contact, Info, Package } from "lucide-react";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import type { Value } from "react-phone-number-input";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import QuotationFormContatcs from "./quotation-form-contacts";
import QuotationFormItemsTable from "./quotation-form-items-table";
import QuotationFormAdditional from "./quotation-form-additional";
import QuotationFormInvalidMessage from "./quotation-form-invalid-message";
import QuotationTotalAmount from "./quotation-total-amount";
import ConfirmQuotation from "./confirm-quotation";
import DeleteQuotation from "../delete-quotation";
import { getQuotationSchema } from "@/lib/schemas";
import QuotationFormInputs from "./quotation-form-inputs";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationFormProps = {
  currentCompany: CompanyType;
  rfq: RFQType;
  closeDialog: () => void;
  quotation?: QuotationType;
};

const QuotationForm = ({
  currentCompany,
  rfq,
  closeDialog,
  quotation,
}: QuotationFormProps) => {
  const t = useTranslations("Quotation");

  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setHeight((ref.current?.clientHeight ?? 0) - 90);
  }, []);

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      id: quotation?.id ?? 0,
      rfqVersionId: rfq.versionId ?? "",
      rfqId: rfq.id ?? "",
      currency: quotation?.currency ?? rfq.currency,
      vatIncluded: quotation?.vatIncluded ?? false,
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
  }, [
    currentCompany,
    currentCompany.email,
    currentCompany.phone,
    form,
    quotation,
  ]);

  return (
    <Form {...form}>
      <form className="flex-auto space-y-10" ref={ref}>
        <Tabs defaultValue="items">
          <TabsList className="grid w-full grid-cols-3 md:max-w-max">
            <TabsTrigger value="items" className="space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden md:block">{t("items")}</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="space-x-2">
              <Contact className="w-4 h-4" />
              <span className="hidden md:block">{t("contacts")}</span>
            </TabsTrigger>
            <TabsTrigger value="additional" className="space-x-2">
              <Info className="w-4 h-4" />
              <span className="hidden md:block">{t("additional")}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="items">
            <QuotationFormInputs />
            {height > 0 && (
              <ScrollArea className="w-full" style={{ height }}>
                <QuotationFormItemsTable rfq={rfq} />
                <ScrollBar orientation="horizontal" className="h-4 z-20" />
                <ScrollBar orientation="vertical" className="w-4 z-20" />
              </ScrollArea>
            )}
          </TabsContent>
          <TabsContent value="contacts">
            <QuotationFormContatcs />
          </TabsContent>
          <TabsContent value="additional">
            <QuotationFormAdditional />
          </TabsContent>
          <QuotationFormInvalidMessage />
        </Tabs>
      </form>
      <DialogFooter className="flex !justify-between px-6">
        <QuotationTotalAmount />
        <div className="flex flex-col-reverse space-y-reverse space-y-2 mb-2 md:space-x-2 md:space-y-0 md:flex-row md:mb-0">
          {quotation && <DeleteQuotation quotation={quotation} />}
          <ConfirmQuotation quotation={quotation} closeDialog={closeDialog} />
        </div>
      </DialogFooter>
    </Form>
  );
};

export default QuotationForm;
