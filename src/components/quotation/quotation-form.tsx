"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import type { Prisma } from "@prisma/client";
import { List } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import QuotationItem from "./quotation-item";
import ConfirmQuotation from "./confirm-quotation";
import { getQuotationSchema } from "@/lib/schemas";
import { Package } from "lucide-react";

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
};

const QuotationForm = ({ rfq, quotation }: QuotationFormProps) => {
  const t = useTranslations("QuotationForm");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      id: quotation?.id,
      rfqVersionId: rfq.versionId,
      rfqId: rfq.id,
      currency: quotation?.currency || rfq.currency,
      description: quotation?.description,
      items: rfq.items.map((rfqItem) => {
        const quotationItem = quotation?.items.find(
          (quotationItem) => quotationItem.rfqItemId === rfqItem.id
        );
        return {
          id: quotationItem?.id,
          rfqItemVersionId: rfqItem.versionId,
          rfqItemId: rfqItem.id,
          productName: rfqItem.productName,
          productId: rfqItem.productId || undefined,
          product: rfqItem.product || undefined,
          quantity: Number(quotationItem?.quantity) || undefined,
          price: Number(quotationItem?.price) || undefined,
          amount: Number(quotationItem?.price) || undefined,
          vatRate: quotationItem?.vatRate || undefined,
          vatIncluded: quotationItem?.vatIncluded || undefined,
          deliveryDate: quotationItem?.deliveryDate || undefined,
          comment: quotationItem?.comment || undefined,
          skip: quotationItem?.skip || undefined,
        };
      }),
    },
  });

  const items = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <Form {...form}>
      <form className="space-y-10">
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
        <ConfirmQuotation rfq={rfq} quotation={quotation} />
      </form>
    </Form>
  );
};

export default QuotationForm;
