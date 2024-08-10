"use client";
import "react-phone-number-input/style.css";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { type Value } from "react-phone-number-input";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { getRFQSchema } from "@/lib/schemas";
import request from "@/lib/request";
import RFQFormContatcs from "./rfq-form-contacts";
import RFQFormMain from "./rfq-form-main";
import RFQFormAdditional from "./rfq-form-additional";
import RFQFormItemsTable from "./rfq-form-items-table";

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
        <Tabs defaultValue="main" className="h-full">
          <TabsList className="max-w-max">
            <TabsTrigger value="main">{t("main")}</TabsTrigger>
            <TabsTrigger value="items">{t("items")}</TabsTrigger>
            <TabsTrigger value="contacts">{t("contacts")}</TabsTrigger>
            <TabsTrigger value="additional">{t("additional")}</TabsTrigger>
          </TabsList>
          <TabsContent value="main">
            <RFQFormMain />
          </TabsContent>
          <TabsContent value="items" className="h-full">
            <ScrollArea className="w-full min-h-full">
              <RFQFormItemsTable />
              <ScrollBar orientation="horizontal" className="h-4" />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="contacts">
            <RFQFormContatcs />
          </TabsContent>
          <TabsContent value="additional">
            <RFQFormAdditional />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default RFQForm;
