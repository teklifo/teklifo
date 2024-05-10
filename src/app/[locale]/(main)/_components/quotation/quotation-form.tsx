"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import type { Prisma } from "@prisma/client";
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

  const update = rfq !== undefined;

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

  return <div>Quotation form</div>;
};

export default QuotationForm;
