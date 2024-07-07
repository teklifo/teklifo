import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FieldArrayWithId, useFormContext } from "react-hook-form";
import * as z from "zod";
import { MoreHorizontal, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Product as ProductType } from "@prisma/client";
import ProductSelect from "@/components/product/product-select";
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
import { Textarea } from "../ui/textarea";
import { getRFQSchema } from "@/lib/schemas";
import { cn, dateFnsLocale } from "@/lib/utils";

type RFQItemProps = {
  productField: FieldArrayWithId;
  index: number;
  removeProduct: () => void;
};

const RFQItem = ({ productField, index, removeProduct }: RFQItemProps) => {
  const t = useTranslations("RFQForm");

  const locale = useLocale()

  const [openProducts, setOpenProducts] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  function onProductSelect(product: ProductType) {
    form.setValue(`items.${index}.productName`, product.name);
    form.setValue(`items.${index}.productId`, product.id);
    form.setValue(`items.${index}.product`, product);
    form.trigger(`items.${index}.productName`);
    setOpenProducts(false);
  }

  function onProductRemove() {
    form.setValue(`items.${index}.productName`, "");
    form.setValue(`items.${index}.productId`, undefined);
    form.setValue(`items.${index}.product`, undefined);
    setOpenProducts(false);
  }

  const productSelected = (form.watch(`items.${index}.productId`) ?? 0) !== 0;

  return (
    <Card key={productField.id} className="h-full w-full">
      <CardHeader className="flex flex-row justify-between items-center pb-2">
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
            {t("deleteItem")}
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-2">
        {
          <FormField
            control={form.control}
            name={`items.${index}.productName`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("productName")}</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-start space-y-2 space-x-0 mt-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
                    {productSelected ? (
                      <div className="text-2xl font-semibold tracking-tight">
                        {form.getValues(`items.${index}.product`)?.name}
                      </div>
                    ) : (
                      <Input {...field} autoComplete="off" />
                    )}
                    {/* Product */}
                    <div className="flex flex-row space-x-2">
                      <Tooltip delayDuration={1000}>
                        <Dialog
                          open={openProducts}
                          onOpenChange={setOpenProducts}
                        >
                          <DialogTrigger asChild>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col space-y-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-fit space-x-2"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                  {!productSelected && (
                                    <span>{t("selectProduct")}</span>
                                  )}
                                </Button>
                              </div>
                            </TooltipTrigger>
                          </DialogTrigger>
                          <ProductSelect onSelect={onProductSelect} />
                        </Dialog>
                        {productSelected && (
                          <TooltipContent
                            side="bottom"
                            className="flex items-center gap-4"
                          >
                            {t("selectProduct")}
                          </TooltipContent>
                        )}
                      </Tooltip>
                      {productSelected && (
                        <Tooltip delayDuration={1000}>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-fit space-x-2"
                              onClick={onProductRemove}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="flex items-center gap-4"
                          >
                            {t("removeProduct")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        }
        <div className="grid md:grid-cols-4 gap-4">
          {/* Quantity */}
          <FormField
            control={form.control}
            name={`items.${index}.quantity`}
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
            name={`items.${index}.price`}
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
            name={`items.${index}.deliveryDate`}
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
                          format(field.value, "PPP", {locale: dateFnsLocale(locale)})
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
          name={`items.${index}.comment`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("comment")}</FormLabel>
              <FormControl>
                <Textarea {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default RFQItem;
