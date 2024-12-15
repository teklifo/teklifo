"use client";
import "react-phone-number-input/style.css";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { type Value } from "react-phone-number-input";
import { Contact, FileText, Info, Package } from "lucide-react";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import RFQFormContatcs from "./rfq-form-contacts";
import RFQFormMain from "./rfq-form-main";
import RFQFormAdditional from "./rfq-form-additional";
import RFQFormItemsTable from "./rfq-form-items-table";
import RFQFormInvalidMessage from "./rfq-form-invalid-message";
import ConfirmRFQ from "./confirm-rfq";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { getRFQSchema } from "@/lib/schemas";

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

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: rfq?.id ?? "",
      title: rfq?.title ?? "",
      privateRequest: rfq?.privateRequest ?? false,
      currency: rfq?.currency ?? "",
      endDate: rfq ? new Date(rfq.endDate) : undefined,
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
          deliveryDate: new Date(rfqItem.deliveryDate),
          comment: rfqItem.comment,
        };
      }),
    },
  });

  useEffect(() => {
    form.setValue("email", rfq ? rfq.email : currentCompany.email);
    form.setValue("phone", (rfq ? rfq.phone : currentCompany.phone) as Value);
  }, [currentCompany.email, currentCompany.phone, form, rfq]);

  return (
    <Form {...form}>
      <form className="space-y-10">
        <Tabs defaultValue="main" className="relative h-full">
          <TabsList className="grid w-full grid-cols-4 md:max-w-max">
            <TabsTrigger value="main" className="space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden md:block">{t("main")}</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="space-x-2">
              <Package className="w-4 h-4" />
              <span className="hidden md:block">{t("items")}</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="space-x-2">
              <Contact className="w-4 h-4" />
              <span className="hidden md:block">{t("contacts")}</span>
            </TabsTrigger>
            <TabsTrigger value="additional" className="space-x-2">
              <Info className="w-4 h-4" />
              <span className="hidden md:block">{t("additional")}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="main">
            <RFQFormMain />
          </TabsContent>
          <TabsContent value="items" className="h-full">
            <RFQFormItemsTable />
          </TabsContent>
          <TabsContent value="contacts">
            <RFQFormContatcs />
          </TabsContent>
          <TabsContent value="additional">
            <RFQFormAdditional />
          </TabsContent>
        </Tabs>
        <RFQFormInvalidMessage />
        <ConfirmRFQ rfq={rfq} />
      </form>
    </Form>
  );
};

export default RFQForm;
