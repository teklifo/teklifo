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

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead className="border min-w-[400px]">{t("product")}</TableHead>
          <TableHead className="border min-w-[100px] bg-muted">
            {t("rfqQuantity")}
          </TableHead>
          <TableHead className="border min-w-[100px]">
            {t("quantity")}
          </TableHead>
          <TableHead className="border min-w-[100px] bg-muted">
            {t("rfqPrice")}
          </TableHead>
          <TableHead className="border min-w-[100px]">{t("price")}</TableHead>
          <TableHead className="border min-w-[100px]">{t("amount")}</TableHead>
          <TableHead className="border min-w-[100px]">{t("vatRate")}</TableHead>
          <TableHead className="border min-w-[100px]">
            {t("vatAmount")}
          </TableHead>
          <TableHead className="border min-w-[100px]">
            {t("amountWithVat")}
          </TableHead>
          <TableHead className="border min-w-[100px] bg-muted">
            {t("rfqDeliveryDate")}
          </TableHead>
          <TableHead className="border min-w-[100px]">
            {t("deliveryDate")}
          </TableHead>
          <TableHead className="border min-w-[100px]">{t("comment")}</TableHead>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TableHead className="border min-w-[100px]">
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
      <TableBody>
        {items.fields.map((productField, index) => {
          const rfqItem = rfq.items.find(
            (e) => e.id === productField.rfqItemId
          );
          if (!rfqItem) return null;

          return <QuotationItem rfqItem={rfqItem} key={index} index={index} />;
        })}
      </TableBody>
    </Table>
  );
};

export default QuotationFormItemsTable;
