import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FieldArrayWithId, useFormContext } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { RequestForQuotationProducts, VatRates } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getQuotationSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import {
  calculateAmountWithVat,
  calculateVatAmount,
  getVatRatePercentage,
} from "@/lib/calculations";

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

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();
  const setValue = form.setValue;

  const product = form.getValues(`products.${index}.product`);

  const quantity = form.watch(`products.${index}.quantity`);
  const price = form.watch(`products.${index}.price`);
  const amount = form.watch(`products.${index}.amount`);
  const vatIncluded = form.watch(`products.${index}.vatIncluded`);
  const vatRate = form.watch(`products.${index}.vatRate`);
  const vatRateInfo = getVatRatePercentage(vatRate);
  const vatAmount =
    calculateVatAmount(amount, vatRateInfo.vatRatePercentage) || 0;

  const amountWithVat =
    calculateAmountWithVat(amount, vatAmount, vatIncluded) || 0;

  const skip = form.watch(`products.${index}.skip`);

  useEffect(() => {
    const value = quantity * price;
    setValue(`products.${index}.amount`, value || 0);
  }, [index, setValue, price, quantity]);

  return (
    <Card key={productField.id} className="h-full w-full">
      <CardHeader className="flex flex-col justify-between space-y-0">
        {/* Product */}
        <div className="bg-muted p-6 rounded-md space-y-3">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("requested")}:`}
          </h4>
          <p className="text-2xl font-semibold tracking-tight">
            {`#${index + 1} ${product.name}`}
          </p>
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
              )} ${form.getValues("currency")}`}</span>
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 relative">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("myQuotation")}:`}
          </h4>
          <div className={cn("grid md:grid-cols-4 gap-4", skip && "hidden")}>
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
            {/* Amount */}
            <FormField
              disabled
              control={form.control}
              name={`products.${index}.amount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className={cn("grid md:grid-cols-4 gap-4", skip && "hidden")}>
            {/* VAT Rate */}
            <FormField
              control={form.control}
              name={`products.${index}.vatRate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("vatRate")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectVatRate")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(VatRates).map((key) => (
                        <SelectItem key={key} value={key}>
                          {t(key)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* VAT amount */}
            <div className="space-y-2">
              <Label htmlFor="vatAmount">{t("vatAmount")}</Label>
              <Input
                disabled
                type="text"
                id="vatAmount"
                value={Number(vatAmount).toFixed(2)}
                className="h-10"
              />
            </div>
            {/* Amount with VAT */}
            <div className="space-y-2">
              <Label htmlFor="amountWithVat">{t("amountWithVat")}</Label>
              <Input
                disabled
                type="text"
                id="amountWithVat"
                value={Number(amountWithVat).toFixed(2)}
                className="h-10"
              />
            </div>
            {/* VAT included */}
            <FormField
              control={form.control}
              name={`products.${index}.vatIncluded`}
              render={({ field }) => (
                <FormItem className="flex flex-row mb-5 items-end space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {t("vatIncluded")}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <div className={cn("grid md:grid-cols-4 gap-4", skip && "hidden")}>
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
                  <Textarea {...field} autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Skip */}
          <div className="flex flex-row items-center !mt-4 space-x-2">
            <FormField
              control={form.control}
              name={`products.${index}.skip`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-end text-muted-foreground space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {t("skip")}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{t("skipHint")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationProduct;
