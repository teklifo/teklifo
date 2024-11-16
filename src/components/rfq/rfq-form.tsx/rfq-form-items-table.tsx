import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";
import * as z from "zod";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import RFQItem from "./rfq-item";
import { getRFQSchema } from "@/lib/schemas";

const RFQFormItemsTable = () => {
  const t = useTranslations("RFQForm");

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const items = useFieldArray({
    control: form.control,
    name: "items",
  });

  return (
    <div className="mt-4 space-y-4 py-6">
      <Button
        type="button"
        variant="outline"
        className="space-x-2"
        onClick={() =>
          items.append({
            productName: "",
            quantity: 0,
            price: 0,
            deliveryDate: new Date(),
            comment: "",
            externalId: Date.now().toString(),
          })
        }
      >
        <Plus />
        <span>{t("addItem")}</span>
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border min-w-[25rem]">
              {t("product")}
            </TableHead>
            <TableHead className="border min-w-[10rem]">
              {t("quantity")}
            </TableHead>
            <TableHead className="border min-w-[10rem]">{t("price")}</TableHead>
            <TableHead className="border min-w-[10rem]">
              {t("deliveryDate")}
            </TableHead>
            <TableHead className="border min-w-[15rem]">
              {t("comment")}
            </TableHead>
            <TableHead className="border min-w-[5rem]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.fields.map((productField, index) => {
            return (
              <RFQItem
                key={productField.id}
                index={index}
                removeProduct={() => {
                  items.remove(index);
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RFQFormItemsTable;
