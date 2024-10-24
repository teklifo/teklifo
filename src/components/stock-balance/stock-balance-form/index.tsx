"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import StockBalanceTable from "./stock-balance-table";
import ConfirmStockBalances from "./confirm-stock-balance";
import { Form } from "@/components/ui/form";
import { getStockBalanceSchema } from "@/lib/schemas";
import { ProductStocks } from "@/types";

type StockBalanceFormProps = {
  productId: number;
  stocks: ProductStocks[];
};

const StockBalanceForm = ({ productId, stocks }: StockBalanceFormProps) => {
  const st = useTranslations("Schemas.stockBalanceSchema");
  const formSchema = getStockBalanceSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: stocks.map((stock) => {
        return {
          productId: productId,
          stockId: stock.id,
          stockName: stock.name,
          quantity:
            stock.balance.length > 0 ? Number(stock.balance[0].quantity) : 0,
        };
      }),
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-10">
        <StockBalanceTable />
        <ConfirmStockBalances productId={productId} />
      </form>
    </Form>
  );
};

export default StockBalanceForm;
