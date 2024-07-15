"use client";
import "react-phone-number-input/style.css";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import PhoneNumberInput, { type Value } from "react-phone-number-input";
import {
  Plus,
  CalendarIcon,
  CheckCircle2,
  Info,
  Package,
  Text,
  Phone,
} from "lucide-react";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import RFQItem from "./rfq-item";
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
import { cn, dateFnsLocale } from "@/lib/utils";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type RFQFormProps = {
  rfq?: RFQType;
  currentCompany: CompanyType;
};

const RFQForm = ({ rfq, currentCompany }: RFQFormProps) => {
  const t = useTranslations("RFQForm");

  const locale = useLocale();

  const update = rfq !== undefined;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: rfq?.id ?? "",
      title: rfq?.title ?? "",
      privateRequest: rfq?.privateRequest ?? false,
      currency: rfq?.currency ?? "",
      endDate: rfq?.endDate,
      contactPerson: rfq?.contactPerson ?? "",
      email: "",
      phone: "",
      description: rfq?.description ?? "",
      deliveryAddress: rfq?.deliveryAddress ?? "",
      deliveryTerms: rfq?.deliveryTerms ?? "",
      paymentTerms: rfq?.paymentTerms ?? "",
      items: rfq?.items.map((rfqItem) => {
        return {
          id: rfqItem.id ?? "",
          productName: rfqItem.productName ?? "",
          productId: rfqItem.productId ?? undefined,
          product: rfqItem.product || undefined,
          quantity: Number(rfqItem.quantity),
          price: Number(rfqItem.price),
          deliveryDate: rfqItem.deliveryDate,
          comment: rfqItem.comment,
        };
      }),
    },
  });

  useEffect(() => {
    form.setValue("email", rfq ? rfq.email : currentCompany.email);
    form.setValue("phone", (rfq ? rfq.phone : currentCompany.phone) as Value);
  }, [currentCompany.email, currentCompany.phone, form, rfq]);

  const items = useFieldArray({
    control: form.control,
    name: "items",
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
          <div className="flex flex-row items-center border-b pb-2 space-x-2">
            <Info className="w-8 h-8" />
            <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
              {t("main")}
            </h3>
          </div>
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("title")}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" />
                </FormControl>
                <FormDescription>{t("titleDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* End date */}
          <div className="max-w-[240px]">
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("endDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", {
                              locale: dateFnsLocale(locale),
                            })
                          ) : (
                            <span>{t("pickDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
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
                  <Textarea {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        {/* Items */}
        <div className="space-y-4">
          <div className="flex flex-row items-center border-b pb-2 space-x-2">
            <Package className="w-8 h-8" />
            <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
              {`${t("items")} (${form.getValues("items")?.length || 0})`}
            </h3>
          </div>
          {items.fields.map((productField, index) => (
            <RFQItem
              key={index}
              productField={productField}
              index={index}
              removeProduct={() => {
                items.remove(index);
              }}
            />
          ))}
          <FormMessage>
            {(form.formState.errors.items &&
              form.formState.errors.items.message) ||
              ""}
          </FormMessage>
          <div className="flex justify-center items-center">
            <Button
              type="button"
              className="space-x-2"
              onClick={() =>
                items.append({
                  productName: "",
                  quantity: 0,
                  price: 0,
                  deliveryDate: new Date(),
                  comment: "",
                })
              }
            >
              <Plus />
              <span>{t("addItem")}</span>
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-row items-center border-b pb-2 space-x-2">
            <Text className="w-8 h-8" />
            <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
              {t("additional")}
            </h3>
          </div>
          {/* Delivery address*/}
          <FormField
            control={form.control}
            name="deliveryAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("deliveryAddress")}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" />
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
          {/* Public */}
          <div className="relative">
            <FormField
              control={form.control}
              name="privateRequest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t("makePrivate")}</FormLabel>
                    <FormDescription>{t("makePrivateHint")}</FormDescription>
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
          </div>
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
