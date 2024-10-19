"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import PriceTable from "./price-table";
import ConfirmPrices from "./confirm-prices";
import { Form } from "@/components/ui/form";
import { getPriceSchema } from "@/lib/schemas";
import { ProductPriceType } from "@/types";

type PriceFormProps = {
  productId: number;
  priceTypes: ProductPriceType[];
};

const PriceForm = ({ productId, priceTypes }: PriceFormProps) => {
  const st = useTranslations("Schemas.pricesSchema");
  const formSchema = getPriceSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prices: priceTypes.map((priceType) => {
        return {
          productId: productId,
          priceTypeId: priceType.id,
          priceTypeName: priceType.name,
          priceTypeCurrency: priceType.currency,
          price:
            priceType.prices.length > 0 ? Number(priceType.prices[0].price) : 0,
        };
      }),
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-10">
        <PriceTable />
        <ConfirmPrices />
      </form>
    </Form>
  );
};

export default PriceForm;
