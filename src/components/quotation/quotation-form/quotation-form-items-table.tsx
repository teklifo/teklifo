import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";
import * as z from "zod";
import type { Prisma } from "@prisma/client";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuotationItem from "./quotation-item";
import { getQuotationSchema } from "@/lib/schemas";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationFormItemsTableProps = {
  rfq: RFQType;
};

const QuotationFormItemsTable = ({ rfq }: QuotationFormItemsTableProps) => {
  const t = useTranslations("Quotation");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const items = useFieldArray({
    control: form.control,
    name: "items",
  });

  const memorizedItems = useMemo(
    () =>
      items.fields.map((productField, index) => {
        const rfqItem = rfq.items.find((e) => e.id === productField.rfqItemId);
        if (!rfqItem) return null;

        return (
          <QuotationItem
            key={productField.id}
            index={index}
            rfqItem={rfqItem}
            setValue={form.setValue}
          />
        );
      }),
    [form.setValue, items.fields, rfq.items]
  );

  return (
    <Table className="mb-4 mr-4 border-separate border-spacing-0">
      <TableHeader className="sticky top-0 bg-background shadow-md z-10">
        <TableRow>
          <TableHead className="border min-w-[25rem]">{t("product")}</TableHead>
          <TableHead className="border min-w-[10rem] bg-muted">
            {t("rfqQuantity")}
          </TableHead>
          <TableHead className="border min-w-[10rem]">
            {t("quantity")}
          </TableHead>
          <TableHead className="border min-w-[10rem] bg-muted">
            {t("rfqPrice")}
          </TableHead>
          <TableHead className="border min-w-[10rem]">{t("price")}</TableHead>
          <TableHead className="border min-w-[10rem]">{t("amount")}</TableHead>
          <TableHead className="border min-w-[10rem]">{t("vatRate")}</TableHead>
          <TableHead className="border min-w-[10rem]">
            {t("vatAmount")}
          </TableHead>
          <TableHead className="border min-w-[10rem]">
            {t("amountWithVat")}
          </TableHead>
          <TableHead className="border min-w-[15rem] bg-muted">
            {t("rfqDeliveryDate")}
          </TableHead>
          <TableHead className="border min-w-[15rem]">
            {t("deliveryDate")}
          </TableHead>
          <TableHead className="border min-w-[15rem] bg-muted">
            {t("rfqComment")}
          </TableHead>
          <TableHead className="border min-w-[15rem]">{t("comment")}</TableHead>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="border min-w-[10rem]">
                  {t("skip")}
                </TableHead>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t("skipHint")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableRow>
      </TableHeader>
      <TableBody>{memorizedItems}</TableBody>
    </Table>
  );
};

export default QuotationFormItemsTable;
