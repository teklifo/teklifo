"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import type { Prisma } from "@prisma/client";
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

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    products: {
      include: {
        product: true;
      };
    };
  };
}>;

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    products: {
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
      products: rfq.products.map((rfqItem) => {
        const quotationItem = quotation?.products.find(
          (quotationItem) => quotationItem.rfqItemId === rfqItem.id
        );
        return {
          id: quotationItem?.id,
          rfqItemVersionId: rfqItem.versionId,
          rfqItemId: rfqItem.id,
          productId: rfqItem.productId,
          product: rfqItem.product,
          quantity: Number(quotationItem?.quantity) || 0,
          price: Number(quotationItem?.price) || 0,
          amount: Number(quotationItem?.price) || 0,
          vatRate: quotationItem?.vatRate || "NOVAT",
          vatIncluded: quotationItem?.vatIncluded || true,
          deliveryDate: quotationItem?.deliveryDate || new Date(),
          comment: quotationItem?.comment || "",
        };
      }),
    },
  });

  const products = useFieldArray({
    control: form.control,
    name: "products",
  });

  return (
    <Form {...form}>
      <form className="space-y-10">
        <div className="space-y-4">
          <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {`${t("products")} (${form.getValues("products")?.length || 0})`}
          </h3>
          {products.fields.map((productField, index) => {
            const rfqItem = rfq.products.find(
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
          <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {t("additional")}
          </h3>
          {/* Payment terms*/}
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
