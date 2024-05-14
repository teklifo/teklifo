"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Plus, CalendarIcon, CheckCircle2 } from "lucide-react";
import type { Prisma } from "@prisma/client";
import RFQProduct from "./rfq-product";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getRFQSchema } from "@/lib/schemas";
import request from "@/lib/request";
import { cn } from "@/lib/utils";

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
  rfq?: RFQType;
};

const RFQForm = ({ rfq }: RFQFormProps) => {
  const t = useTranslations("RFQForm");

  const update = rfq !== undefined;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: rfq?.id,
      publicRequest: rfq?.publicRequest,
      currency: rfq?.currency,
      date: rfq
        ? {
            from: rfq.startDate,
            to: rfq.endDate,
          }
        : undefined,
      description: rfq?.description,
      deliveryAddress: rfq?.deliveryAddress,
      deliveryTerms: rfq?.deliveryTerms,
      paymentTerms: rfq?.paymentTerms,
      products: rfq?.products.map((rfqRow) => {
        return {
          id: rfqRow.id,
          productId: rfqRow.productId ?? undefined,
          product: rfqRow.product || undefined,
          quantity: Number(rfqRow.quantity),
          price: Number(rfqRow.price),
          deliveryDate: rfqRow.deliveryDate,
          comment: rfqRow.comment,
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
        const updatedRfq = await request<RFQType>(`/api/rfq/${rfq.id}`, config);

        toast({
          title: t("rfqIsUpdated"),
          description: t("rfqIsUpdatedHint"),
        });

        window.location.href = `/rfq/${updatedRfq.id}`;
      } else {
        const newRfq = await request<RFQType>(`/api/rfq/`, config);

        toast({
          title: t("newRFQIsCreated"),
          description: t("newRFQHint"),
        });

        window.location.href = `/rfq/${newRfq.id}`;
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
            {t("main")}
          </h3>
          {/* Public */}
          <FormField
            control={form.control}
            name="publicRequest"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm !mb-10">
                <div className="space-y-0.5">
                  <FormLabel>{t("makePublic")}</FormLabel>
                  <FormDescription>{t("makePublicHint")}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {/* Period */}
          <div className="flex flex-col space-y-2 md:flex-row md:items-end md:justify-start md:space-x-8">
            <FormField
              control={form.control}
              name={`date`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span>{t("pickADate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field?.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Currency*/}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("currency")}</FormLabel>
                <FormControl>
                  <Input {...field} className="w-[240px]" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        {/* Products */}
        <div className="space-y-4">
          <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {`${t("products")} (${form.getValues("products")?.length || 0})`}
          </h3>
          {products.fields.map((productField, index) => (
            <RFQProduct
              key={index}
              productField={productField}
              index={index}
              removeProduct={() => {
                products.remove(index);
              }}
            />
          ))}
          <Button
            type="button"
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
        <div className="space-y-4">
          <h3 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {t("additional")}
          </h3>
          {/* Delivery address*/}
          <FormField
            control={form.control}
            name="deliveryAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("deliveryAddress")}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Delivery terms*/}
          <FormField
            control={form.control}
            name="deliveryTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("deliveryTerms")}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Payment terms*/}
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("paymentTerms")}</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full space-x-2">
          <CheckCircle2 />
          <span>{update ? t("update") : t("create")}</span>
        </Button>
      </form>
    </Form>
  );
};

export default RFQForm;
