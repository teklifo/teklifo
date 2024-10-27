import { useTranslations } from "next-intl";
import { useFieldArray, useFormContext } from "react-hook-form";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PriceItem from "./price-item";
import { getPriceSchema } from "@/lib/schemas";

const PriceTable = () => {
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border">{t("priceType")}</TableHead>
            <TableHead className="border">{t("currency")}</TableHead>
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
