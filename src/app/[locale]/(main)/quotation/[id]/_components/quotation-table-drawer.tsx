"use client";

import { QuotationItemType } from "./quotation-items-table/columns";
import QuotationItemsTable from "./quotation-items-table";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type QuotationTableDrawerProps = {
  items: QuotationItemType[];
};

const QuotationTableDrawer = ({ items }: QuotationTableDrawerProps) => {
  const t = useTranslations("Quotation");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          {t("openTable")}
        </Button>
      </DialogTrigger>
      <DialogContent className="block space-y-8 max-w-[90%] h-[95%] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("itemList")}</DialogTitle>
          <DialogDescription>{t("itemListHint")}</DialogDescription>
        </DialogHeader>
        <div className="h-[90%] overflow-auto">
          <QuotationItemsTable items={items} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationTableDrawer;
