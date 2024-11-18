"use client";

import { useTranslations } from "next-intl";
import { Table2 } from "lucide-react";
import { Prisma } from "@prisma/client";
import RFQItemsTable from "@/components/rfq/rfq-view/rfq-view-items-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RequestForQuotationItemType = Prisma.RequestForQuotationItemGetPayload<{
  include: {
    product: true;
  };
}>;

type RFQItemsViewProps = {
  rfqItems: RequestForQuotationItemType[];
};

const RFQItemsView = ({ rfqItems }: RFQItemsViewProps) => {
  const t = useTranslations("RFQ");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full space-x-2">
          <Table2 />
          <span>{t("viewItemsAsTable")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="mt-0 px-0 flex flex-col max-w-[100vw] h-[100vh] md:max-w-[90vw] md:h-[95vh] sm:p-6">
        <DialogHeader>
          <DialogTitle>{t("rfqItems")}</DialogTitle>
          <DialogDescription>{t("rfqItemsHint")}</DialogDescription>
        </DialogHeader>
        <div className="h-full md:h-auto">
          <RFQItemsTable
            items={rfqItems}
            scrollClass="h-[calc(100vh-15rem)]"
            selectRows={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RFQItemsView;
