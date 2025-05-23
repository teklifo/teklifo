"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Contact, Info, Loader, Package } from "lucide-react";
import { Prisma } from "@prisma/client";
import CompanyAvatar from "@/components/company/company-avatar";
import QuotationViewContatcs from "./quotation-view-contacts";
import QuotationViewAdditional from "./quotation-view-additional";
import QuotationViewItemsTable from "../quotation-view/quotation-view-items-table";
import QuotationViewFooter from "./quotation-view-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <div className="flex-auto space-y-6">
        <CompanyAvatar
          company={quotation.company}
          className="flex flex-row justify-center items-center space-x-4 md:justify-start"
          titleClass="text-start"
        />
        <Tabs defaultValue="items">
          <TabsList className="grid w-full grid-cols-3 md:max-w-max">
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
          <TabsContent value="items">
            <div className="h-full md:h-auto">
              <QuotationViewItemsTable
                items={quotation.items}
                scrollClass="h-[calc(100vh-24rem)] md:h-[calc(100vh-28rem)]"
              />
            </div>
          </TabsContent>
          <TabsContent value="contacts">
            <QuotationViewContatcs quotation={quotation} />
          </TabsContent>
          <TabsContent value="additional">
            <QuotationViewAdditional quotation={quotation} />
          </TabsContent>
        </Tabs>
      </div>
      <DialogFooter className="px-6">
        <QuotationViewFooter quotation={quotation} />
      </DialogFooter>
    </>
  );
};

export default QuotationView;
