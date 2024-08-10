"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader } from "lucide-react";
import { Prisma } from "@prisma/client";
import CompanyAvatar from "@/components/company/company-avatar";
import QuotationViewContatcs from "./quotation-view-contacts";
import QuotationViewAdditional from "./quotation-view-additional";
import QuotationViewItemsTable from "../quotation-view/quotation-view-items-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import request from "@/lib/request";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    items: {
      include: {
        product: true;
        rfqItem: true;
      };
    };
  };
}>;

type QuotationViewProps = {
  quotationId: number;
};

async function getQuotation(quotationId: number) {
  try {
    return await request<QuotationType>(`/api/quotation/${quotationId}`, {
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
}

const QuotationView = ({ quotationId }: QuotationViewProps) => {
  const t = useTranslations("Quotation");

  const [loading, setLoading] = useState<boolean>(true);
  const [quotation, setQuotation] = useState<QuotationType>();

  useEffect(() => {
    const fetchQuotation = async () => {
      if (quotationId) {
        const result = await getQuotation(quotationId);
        if (result) {
          setQuotation(result);
        }
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId]);

  if (loading)
    return (
      <div className="w-[100%] h-[80vh] flex flex-col justify-center items-center">
        <Loader className="mr-2 animate-spin" />
      </div>
    );

  if (!quotation) return null;

  return (
    <>
      <CompanyAvatar
        company={quotation.company}
        className="flex flex-row justify-start items-center space-x-4"
      />
      <Tabs defaultValue="items" className="h-full">
        <TabsList className="max-w-max">
          <TabsTrigger value="items">{t("items")}</TabsTrigger>
          <TabsTrigger value="contacts">{t("contacts")}</TabsTrigger>
          <TabsTrigger value="additional">{t("additional")}</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="!mt-0 h-full">
          <ScrollArea className="w-full min-h-full">
            <QuotationViewItemsTable items={quotation.items} />
            <ScrollBar orientation="horizontal" className="h-4" />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="contacts">
          <QuotationViewContatcs quotation={quotation} />
        </TabsContent>
        <TabsContent value="additional">
          <QuotationViewAdditional quotation={quotation} />
        </TabsContent>
      </Tabs>
      <DialogFooter className="px-6"></DialogFooter>
    </>
  );
};

export default QuotationView;
