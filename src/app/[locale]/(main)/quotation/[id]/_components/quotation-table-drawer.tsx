"use client";

import { QuotationItemType } from "./quotation-items-table/columns";
import QuotationItemsTable from "./quotation-items-table";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type QuotationTableDrawerProps = {
  items: QuotationItemType[];
};

const QuotationTableDrawer = ({ items }: QuotationTableDrawerProps) => {
  const t = useTranslations("Quotation");

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full">
          {t("openTable")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full">
          <DrawerHeader>
            <DrawerTitle>{t("itemList")}</DrawerTitle>
            <DrawerDescription>{t("itemListHint")}</DrawerDescription>
          </DrawerHeader>
          <QuotationItemsTable items={items} />
          <DrawerFooter className="flex flex-row justify-center">
            <DrawerClose asChild>
              <Button variant="outline">{t("close")}</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default QuotationTableDrawer;
