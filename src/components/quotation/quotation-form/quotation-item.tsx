import { useEffect } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import {
  Control,
  ControllerRenderProps,
  FieldArrayWithId,
  useFormContext,
} from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { RequestForQuotationItem, VatRates } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { getQuotationSchema } from "@/lib/schemas";
import { cn, dateFnsLocale } from "@/lib/utils";
import {
  calculateAmountWithVat,
  calculateVatAmount,
  getVatRatePercentage,
} from "@/lib/calculations";

type QuotationItemProps = {
  rfqItem: RequestForQuotationItem;
  productField: FieldArrayWithId;
  index: number;
};

type CellFieldProps = {
  control: Control<any>;
  name: string;
  value?: string | number | readonly string[] | undefined;
};

type TableInputProps = {
  field: ControllerRenderProps<any, string>;
  value?: string | number | readonly string[] | undefined;
};

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <TableCell className="p-0 border-none">{children}</TableCell>;
};

const CellField = ({ control, name, value }: CellFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TableInput field={field} value={value} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

const TableInput = ({ field, value }: TableInputProps) => {
  const { error } = useFormField();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Input
            {...field}
            value={value || field.value}
            autoComplete="off"
            className={cn(
              "border rounded-none focus:outline-none focus:ring-0 focus-visible:outline-0 focus-visible:outline-offset-0  focus-visible:ring-0 focus-visible:ring-offset-0",
              error && "bg-red-300"
            )}
          />
        </TooltipTrigger>
        {error && (
          <TooltipContent side="bottom">
            <p>{error?.message}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const QuotationItem = ({
  rfqItem,
  productField,
  index,
}: QuotationItemProps) => {
  const t = useTranslations("Quotation");
  const intlFormat = useFormatter();

  const locale = useLocale();

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();
  const setValue = form.setValue;

  const productName = form.watch(`items.${index}.productName`);
  const product = form.getValues(`items.${index}.product`);
  const quantity = form.watch(`items.${index}.quantity`);
  const price = form.watch(`items.${index}.price`);
  const amount = form.watch(`items.${index}.amount`);
  const vatIncluded = form.watch(`items.${index}.vatIncluded`);
  const vatRate = form.watch(`items.${index}.vatRate`);
  const vatRateInfo = getVatRatePercentage(vatRate);
  const vatAmount =
    calculateVatAmount(amount, vatRateInfo.vatRatePercentage) ?? 0;

  const amountWithVat =
    calculateAmountWithVat(amount, vatAmount, vatIncluded) ?? 0;

  const skip = form.watch(`items.${index}.skip`);

  useEffect(() => {
    const value = quantity * price;
    setValue(`items.${index}.amount`, value ?? 0);
  }, [index, setValue, price, quantity]);

  return (
    <TableRow className="border-none">
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          {productName}
        </div>
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border bg-muted">
          {intlFormat.number(Number(rfqItem.quantity), {
            style: "decimal",
            minimumFractionDigits: 3,
          })}
        </div>
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.quantity`} />
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border bg-muted">
          {intlFormat.number(Number(rfqItem.price), {
            style: "decimal",
            minimumFractionDigits: 2,
          })}
        </div>
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.price`} />
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          {intlFormat.number(Number(amount), {
            style: "decimal",
            minimumFractionDigits: 2,
          })}
        </div>
      </Cell>
      <Cell>
        <FormField
          control={form.control}
          name={`items.${index}.vatRate`}
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border rounded-none focus:outline-none focus:ring-0 focus-visible:outline-0 focus-visible:outline-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">
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
            </FormItem>
          )}
        />
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          {intlFormat.number(Number(vatAmount), {
            style: "decimal",
            minimumFractionDigits: 2,
          })}
        </div>
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          {intlFormat.number(Number(amountWithVat), {
            style: "decimal",
            minimumFractionDigits: 2,
          })}
        </div>
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border bg-muted">
          {format(rfqItem.deliveryDate, "dd.MM.yyyy")}
        </div>
      </Cell>
      <Cell>
        <FormField
          control={form.control}
          name={`items.${index}.deliveryDate`}
          render={({ field }) => (
            <FormItem>
              <Popover>
                <PopoverTrigger asChild className="rounded-none">
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", {
                          locale: dateFnsLocale(locale),
                        })
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
            </FormItem>
          )}
        />
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.comment`} />
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          <FormField
            control={form.control}
            name={`items.${index}.skip`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-end text-muted-foreground space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </Cell>
    </TableRow>
  );
};

export default QuotationItem;
