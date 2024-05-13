"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
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
import { useToast } from "@/components/ui/use-toast";
import QuotationProduct from "./quotation-product";
import ConfirmQuotation from "./confirm-quotation";
import { getQuotationSchema } from "@/lib/schemas";
import request from "@/lib/request";

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

type RFQFormProps = {
  rfq: RFQType;
  quotation?: QuotationType;
};

const QuotationForm = ({ rfq, quotation }: RFQFormProps) => {
  const t = useTranslations("QuotationForm");

  const update = quotation !== undefined;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: quotation?.id,
      rfqId: rfq.id,
      currency: quotation?.currency || rfq.currency,
      description: quotation?.description,
      products: rfq.products.map((rfqRow) => {
        const quotationRow = quotation?.products.find(
          (quotationRow) => quotationRow.rfqRowId === rfqRow.id
        );
        return {
          id: quotationRow?.id,
          rfqRowId: rfqRow.id,
          productId: rfqRow.productId,
          product: rfqRow.product,
          quantity: Number(quotationRow?.quantity) || 0,
          price: Number(quotationRow?.price) || 0,
          amount: Number(quotationRow?.price) || 0,
          vatRate: quotationRow?.vatRate || "NOVAT",
          vatIncluded: quotationRow?.vatIncluded || true,
          deliveryDate: quotationRow?.deliveryDate || new Date(),
          comment: quotationRow?.comment || "",
        };
      }),
    },
  });

  const products = useFieldArray({
    control: form.control,
    name: "products",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const config = {
      method: update ? "put" : "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify(values),
    };

    try {
      if (update) {
        const updatedQuotation = await request<RFQType>(
          `/api/quotation/${rfq.id}`,
          config
        );

        toast({
          title: t("quotationIsUpdated"),
          description: t("quotationIsUpdatedHint"),
        });

        window.location.href = `/quotation/${updatedQuotation.id}`;
      } else {
        const newQuotation = await request<RFQType>(`/api/quotation/`, config);

        toast({
          title: t("newQuotationIsCreated"),
          description: t("newQuotationHint"),
        });

        window.location.href = `/quotation/${newQuotation.id}`;
      }
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: update ? t("updateError") : t("error"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <div className="space-y-4">
          <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {`${t("products")} (${form.getValues("products")?.length || 0})`}
          </h3>
          {products.fields.map((productField, index) => {
            const rfqRow = rfq.products.find(
              (e) => e.id === productField.rfqRowId
            );
            if (!rfqRow) return null;

            return (
              <QuotationProduct
                rfqRow={rfqRow}
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
        <ConfirmQuotation />
      </form>
    </Form>
  );
};

export default QuotationForm;
