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
  productPrices: ProductPriceType[];
  closeDialog: () => void;
};

const PriceForm = ({
  productId,
  productPrices,
  closeDialog,
}: PriceFormProps) => {
  const st = useTranslations("Schemas.pricesSchema");
  const formSchema = getPriceSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prices: productPrices.map((productPrice) => {
        return {
          productId: productId,
          priceTypeId: productPrice.id,
          priceTypeName: productPrice.name,
          price:
            productPrice.prices.length > 0 ? Number(productPrice.prices[0]) : 0,
        };
      }),
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-10">
        <PriceTable productId={productId} />
        <ConfirmPrices closeDialog={closeDialog} />
      </form>
    </Form>
  );
};

export default PriceForm;
