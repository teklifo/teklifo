"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Prisma } from "@prisma/client";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { MoreHorizontal, Plus, X } from "lucide-react";
import RFQProducts from "./rfq-products";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getRFQSchema } from "@/lib/schemas";
import request from "@/lib/request";
import ProductSelect from "../product-select";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: { products: true };
}>;

type RFQFormProps = {
  rfq?: RFQType;
};

const RFQForm = ({ rfq }: RFQFormProps) => {
  const t = useTranslations("RFQForm");

  const update = rfq !== undefined;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openProducts, setOpenProducts] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicRequest: rfq?.publicRequest,
      currency: rfq?.currency,
      startDate: rfq?.startDate,
      endDate: rfq?.endDate,
      description: rfq?.description,
      deliveryAddress: rfq?.deliveryAddress,
      deliveryTerms: rfq?.deliveryTerms,
      paymentTerms: rfq?.paymentTerms,
      products: rfq?.products.map((product) => {
        return {
          productId: product.productId ?? undefined,
          quantity: product.quantity.toNumber(),
          price: product.price.toNumber(),
          deliveryDate: product.deliveryDate,
          comment: product.comment,
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
        await request<RFQType>(`/api/rfq/${rfq.id}`, config);

        toast({
          title: t("rfqIsUpdated"),
          description: t("rfqIsUpdatedHint"),
        });
      } else {
        await request<RFQType>(`/api/rfq/`, config);

        toast({
          title: t("newRFQIsCreated"),
          description: t("newRFQHint"),
        });
      }

      window.location.href = `/outgoing-rfq`;
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("currency")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {products.fields.map((productField, index) => (
          <Card key={productField.id} className="h-full w-full">
            <CardHeader className="flex flex-row items-center space-x-8 space-y-0">
              <Dialog open={openProducts} onOpenChange={setOpenProducts}>
                <DialogTrigger asChild>
                  <Button type="button" className="space-x-2">
                    <MoreHorizontal />
                    <span>{t("selectProduct")}</span>
                  </Button>
                </DialogTrigger>
                <ProductSelect />
              </Dialog>
              <Button
                type="button"
                variant="outline"
                onClick={() => products.remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <RFQProducts index={index} />
            </CardContent>
          </Card>
        ))}
        <div className="flex flex-col items-start space-y-8">
          <div className="flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <Button
              type="button"
              variant="outline"
              className="space-x-2"
              onClick={() =>
                products.append({
                  productId: 0,
                  quantity: 0,
                  price: 0,
                  deliveryDate: new Date(),
                  comment: "",
                })
              }
            >
              <Plus />
              <span>{t("addRow")}</span>
            </Button>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {update ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RFQForm;
