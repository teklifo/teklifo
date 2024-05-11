"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import type { Prisma } from "@prisma/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
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
  const t = useTranslations("RFQForm");

  const update = quotation !== undefined;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
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
          quantity: Number(quotationRow?.quantity),
          price: Number(quotationRow?.price),
          amount: Number(quotationRow?.price),
          vatRate: quotationRow?.vatRate,
          vatIncluded: quotationRow?.vatIncluded,
          deliveryDate: quotationRow?.deliveryDate,
          comment: quotationRow?.comment,
        };
      }),
    },
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
        <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          {`${t("products")} (${form.getValues().products.length || 0})`}
        </h3>
      </form>
    </Form>
  );
};

export default QuotationForm;
