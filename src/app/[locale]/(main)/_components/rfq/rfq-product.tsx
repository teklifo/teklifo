import { useState } from "react";
import { useTranslations } from "next-intl";
import { FieldArrayWithId, useFormContext } from "react-hook-form";
import * as z from "zod";
import { MoreHorizontal, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Product as ProductType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import ProductSelect from "../product-select";
import { getRFQSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type RFQProductProps = {
  productField: FieldArrayWithId;
  index: number;
  removeProduct: () => void;
};

const RFQProduct = ({
  productField,
  index,
  removeProduct,
}: RFQProductProps) => {
  const t = useTranslations("RFQForm");

  const [openProducts, setOpenProducts] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  function onProductSelect(product: ProductType) {
    form.setValue(`products.${index}.productId`, product.id);
    form.setValue(`products.${index}.product`, product);
    setOpenProducts(false);
  }

  const productSelected = form.getValues(`products.${index}.productId`) !== 0;

  return (
    <Card key={productField.id} className="h-full w-full">
      <CardHeader className="flex flex-col-reverse justify-between items-center space-y-0 md:flex-row">
        <div className="flex flex-row items-center space-x-8 mt-4">
          {productSelected && (
            <div className="text-2xl font-semibold tracking-tight">
              {form.getValues(`products.${index}.product`)?.name}
            </div>
          )}
          {/* Product */}
          <Tooltip delayDuration={1000}>
            <Dialog open={openProducts} onOpenChange={setOpenProducts}>
              <DialogTrigger asChild>
                <TooltipTrigger asChild>
                  <div className="flex flex-col space-y-2">
                    <Button type="button" className="w-fit space-x-2">
                      <MoreHorizontal className="w-4 h-4" />
                      {!productSelected && <span>{t("selectProduct")}</span>}
                    </Button>
                    <FormMessage>
                      {(form.formState.errors.products &&
                        form.formState.errors.products[index]?.productId
                          ?.message) ||
                        ""}{" "}
                    </FormMessage>
                  </div>
                </TooltipTrigger>
              </DialogTrigger>
              <ProductSelect onSelect={onProductSelect} />
            </Dialog>
            {productSelected && (
              <TooltipContent side="bottom" className="flex items-center gap-4">
                {t("selectProduct")}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
        <div className="space-x-4">
          <span className="text-2xl font-semibold tracking-tight">
            {`#${index + 1}`}
          </span>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" onClick={removeProduct}>
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-4">
              {t("deleteRow")}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid md:grid-cols-4 gap-4">
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
      </CardContent>
    </Card>
  );
};

export default RFQProduct;
