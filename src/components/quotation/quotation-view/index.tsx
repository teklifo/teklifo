import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const QuotationView = () => {
  const t = useTranslations("QuotationForm");

  return (
    <Tabs defaultValue="items" className="h-full">
      <TabsList className="max-w-max">
        <TabsTrigger value="items">{t("items")}</TabsTrigger>
        <TabsTrigger value="contacts">{t("contacts")}</TabsTrigger>
        <TabsTrigger value="additional">{t("additional")}</TabsTrigger>
      </TabsList>
      <TabsContent value="items" className="h-full">
        <ScrollArea className="w-full min-h-full">
          {/* <QuotationViewTable rfq={rfq} /> */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="contacts">
        {/* <QuotationViewContatcs /> */}
      </TabsContent>
      <TabsContent value="additional">
        {/* <QuotationViewAdditional /> */}
      </TabsContent>
    </Tabs>
  );
};

export default QuotationView;
