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
import StockBalanceItem from "./stock-balance-item";
import { getStockBalanceSchema } from "@/lib/schemas";

const StockBalanceTable = () => {
  const t = useTranslations("StockBalance");

  const st = useTranslations("Schemas.stockBalanceSchema");
  const formSchema = getStockBalanceSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const stockBalance = useFieldArray({
    control: form.control,
    name: "balance",
  });

  return (
    <div className="mt-4 space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border">{t("stock")}</TableHead>
            <TableHead className="border">{t("quantity")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockBalance.fields.map((productField, index) => {
            return <StockBalanceItem key={productField.id} index={index} />;
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockBalanceTable;
