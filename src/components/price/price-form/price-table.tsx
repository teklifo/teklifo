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
import PriceItem from "./price-item";
import { getPriceSchema } from "@/lib/schemas";

type PriceTableProps = {
  productId: number;
};

const PriceTable = ({ productId }: PriceTableProps) => {
  const t = useTranslations("Prices");

  const st = useTranslations("Schemas.pricesSchema");
  const formSchema = getPriceSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const prices = useFieldArray({
    control: form.control,
    name: "prices",
  });

  return (
    <div className="mt-4 space-y-4">
      <Button
        type="button"
        variant="outline"
        className="space-x-2"
        onClick={() =>
          prices.append({
            productId,
            priceTypeId: "",
            price: 0,
          })
        }
      >
        <Plus />
        <span>{t("addPrice")}</span>
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border">{t("priceType")}</TableHead>
            <TableHead className="border">{t("price")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.fields.map((productField, index) => {
            return <PriceItem key={productField.id} index={index} />;
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PriceTable;
