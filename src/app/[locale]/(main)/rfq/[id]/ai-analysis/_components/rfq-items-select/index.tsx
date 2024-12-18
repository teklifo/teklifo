"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { Prisma } from "@prisma/client";
import RFQItemsTable from "@/components/rfq/rfq-view/rfq-view-items-table";
import { RFQItemType } from "@/components/rfq/rfq-view/rfq-view-items-table/columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuotationsAIAnalysisStore } from "../../_store";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type RFQItemsSelectProps = {
  rfq: RequestForQuotationType;
};

const RFQItemsSelect = ({ rfq }: RFQItemsSelectProps) => {
  const t = useTranslations("QuotationsAIAnalysis");

  const [open, setOpen] = useState(false);

  const selectedRfqItems = useQuotationsAIAnalysisStore(
    (state) => state.rfqItems
  );

  const initialSelectedItems = useMemo(() => {
    const initialState: Record<string, boolean> = {};

    if (open) {
      rfq.items.forEach((item, index) => {
        initialState[index] =
          selectedRfqItems.find((versionId) => versionId === item.versionId) !==
          undefined;
      });
    }

    return initialState;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rfq.items]);

  const setRfqItems = useQuotationsAIAnalysisStore(
    (state) => state.setRfqItems
  );

  const onSelectedRowsChange = useCallback(
    (data: RFQItemType[]) => {
      setRfqItems(data.map((row) => row.versionId));
    },
    [setRfqItems]
  );

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex flex-row justify-center items-center space-x-2"
        >
          <Package className="h-4 w-4 text-muted-foreground" />
          {selectedRfqItems.length > 0 ? (
            <span>
              {t("selectedRfqItems", { number: selectedRfqItems.length })}
            </span>
          ) : (
            <span>{t("selectRfqItems")}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="mt-0 px-0 flex flex-col max-w-[100vw] h-[100vh] md:max-w-[90vw] md:h-[95vh] sm:p-6">
        <DialogHeader>
          <DialogTitle>{t("rfqItems")}</DialogTitle>
          <DialogDescription>{t("rfqItemsHint")}</DialogDescription>
        </DialogHeader>
        <div className="h-full md:h-auto">
          <RFQItemsTable
            items={rfq.items}
            scrollClass="h-[calc(100vh-15rem)] md:h-[calc(100vh-17rem)]"
            selectRows={true}
            onSelectedRowsChange={onSelectedRowsChange}
            initialSelectState={initialSelectedItems}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>{t("select")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RFQItemsSelect;
