import { useState } from "react";
import { useTranslations } from "next-intl";
import { FieldArrayWithId, useFormContext } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { RequestForQuotationProducts } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { getQuotationSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type QuotationProductProps = {
  rfqRow: RequestForQuotationProducts;
  productField: FieldArrayWithId;
  index: number;
};

const QuotationProduct = ({
  rfqRow,
  productField,
  index,
}: QuotationProductProps) => {
  const t = useTranslations("QuotationForm");

  const [openProducts, setOpenProducts] = useState(false);

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  const product = form.getValues(`products.${index}.product`);

  return (
    <Card key={productField.id} className="h-full w-full">
      <CardHeader className="flex flex-col justify-between space-y-0">
        {/* Product */}
        <p className="text-2xl font-semibold tracking-tight">
          {`#${index + 1} ${product?.name || t("unknowProduct")}`}
        </p>
        {product && (
          <div className="text-sm">
            <div className="flex flex-row space-x-2">
              <span>{`${t("number")}:`}</span>
              <span>{product.number}</span>
            </div>
            <div className="flex flex-row space-x-2">
              <span>{`${t("unit")}:`}</span>
              <span>{product.unit}</span>
            </div>
            <div className="flex flex-row space-x-2">
              <span>{`${t("brand")}:`}</span>
              <span>{product.brand}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* RFQ info */}
        <div className="bg-muted p-6 rounded-md space-y-3">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("requested")}:`}
          </h4>
          <div className="flex flex-col space-y-2-md md:flex-row md:space-x-8 md:space-y-0">
            <div className="flex flex-col items-start">
              <span className="font-semibold">{`${t("quantity")}`}</span>
              <span className="md:text-xl">
                {Number(rfqRow.quantity).toFixed(3)}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{`${t("price")}`}</span>
              <span className="md:text-xl">{`${Number(rfqRow.price).toFixed(
                2
              )} ${"USD"}`}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{`${t("deliveryDate")}`}</span>
              <span className="md:text-xl">
                {format(rfqRow.deliveryDate, "dd.MM.yyyy")}
              </span>
            </div>
          </div>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {rfqRow.comment}
          </p>
        </div>
        <div className="p-6 space-y-2 border rounded-md">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("myQuotation")}:`}
          </h4>
          <div className="flex flex-col space-x-0 space-y-4 md:flex-row md:justify-start md:space-y-0 md:space-x-8">
            {/* Quantity */}
            <FormField
              control={form.control}
              name={`products.${index}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("quantity")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Price */}
            <FormField
              control={form.control}
              name={`products.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("price")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Delivery date */}
            <FormField
              control={form.control}
              name={`products.${index}.deliveryDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("deliveryDate")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>{t("pickDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Comment*/}
          <FormField
            control={form.control}
            name={`products.${index}.comment`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("comment")}</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationProduct;
