"use client";
import "react-phone-number-input/style.css";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import PhoneNumberInput, { type Value } from "react-phone-number-input";
import { BriefcaseBusiness, List, Package, Phone } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import QuotationItem from "./quotation-item";
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
          price: Number(quotationItem?.price ?? rfqItem.price),
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

  const items = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="text-center whitespace-normal h-auto space-x-2 lg:w-full">
          <BriefcaseBusiness />
          <span>{t("createQuotation")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col space-y-8 max-w-[100%] h-[100%] md:max-w-[90%] md:h-[95%]">
        <DialogHeader className="flex-initial">
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex-auto overflow-auto p-4 space-y-10">
            <div className="space-y-4">
              <div className="flex flex-row items-center border-b pb-2 space-x-2">
                <Phone className="w-8 h-8" />
                <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
                  {t("contacts")}
                </h3>
              </div>
              {/* Contact person*/}
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contactPerson")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Email*/}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Phone*/}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phone")}</FormLabel>
                    <FormControl>
                      <PhoneNumberInput
                        {...field}
                        inputComponent={Input}
                        international
                        autoComplete="off"
                        data-test="phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <div className="flex flex-row items-center border-b pb-2 space-x-2">
                <Package className="w-8 h-8" />
                <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
                  {`${t("items")} (${form.getValues("items")?.length || 0})`}
                </h3>
              </div>
              {items.fields.map((productField, index) => {
                const rfqItem = rfq.items.find(
                  (e) => e.id === productField.rfqItemId
                );
                if (!rfqItem) return null;

                return (
                  <QuotationItem
                    rfqItem={rfqItem}
                    key={index}
                    productField={productField}
                    index={index}
                  />
                );
              })}
            </div>
            <div className="space-y-4">
              <div className="flex flex-row items-center border-b pb-2 space-x-2">
                <List className="w-8 h-8" />
                <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
                  {t("additional")}
                </h3>
              </div>
              {/* Description*/}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={10} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
          <DialogFooter>
            <ConfirmQuotation rfq={rfq} quotation={quotation} />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationForm;
