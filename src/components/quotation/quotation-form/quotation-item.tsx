import { memo, useEffect } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
  Control,
  ControllerRenderProps,
  useFormContext,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { RequestForQuotationItem, VatRates } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  FormControl,
  FormField,
  FormItem,
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
import ClientDate from "@/components/client-date";
import { getQuotationSchema } from "@/lib/schemas";
import {
  calculateAmountWithVat,
  calculateVatAmount,
  getVatRatePercentage,
} from "@/lib/calculations";
import { cn } from "@/lib/utils";

type QuotationItemProps = {
  index: number;
  rfqItem: RequestForQuotationItem;
  setValue: UseFormSetValue<any>;
};

interface CellFieldProps extends React.ComponentPropsWithoutRef<"input"> {
  control: Control<any>;
  name: string;
}

interface TableInputProps extends React.ComponentPropsWithoutRef<"input"> {
  field: ControllerRenderProps<any, string>;
}

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <TableCell className="p-0 border-input border">{children}</TableCell>;
};

const CellField = ({ control, name, ...props }: CellFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TableInput field={field} {...props} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

const TableInput = ({ field, ...props }: TableInputProps) => {
  const { error } = useFormField();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Input
            {...field}
            {...props}
            value={field.value}
            autoComplete="off"
            onBlur={undefined}
            onFocus={(e) => e.target.select()}
            onWheel={(e) => e.currentTarget.blur()}
            className={cn(
              "cursor-pointer border-none rounded-none focus:outline-none focus:ring-0 focus-visible:outline-0 focus-visible:outline-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-green-50 hover:dark:bg-green-900",
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

const EmptyCell = () => {
  return <p className="h-10 w-full px-3 py-2 text-center ">-</p>;
};

const QuotationItem = ({ index, rfqItem, setValue }: QuotationItemProps) => {
  const t = useTranslations("Quotation");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const intlFormat = useFormatter();

  const productName = useWatch({ name: `items.${index}.productName` });
  const quantity = useWatch({ name: `items.${index}.quantity` });
  const price = useWatch({ name: `items.${index}.price` });
  const amount = useWatch({ name: `items.${index}.amount` });
  const vatIncluded = useWatch({ name: `vatIncluded` });
  const vatRate = useWatch({ name: `items.${index}.vatRate` });
  const skip = useWatch({ name: `items.${index}.skip` });

  const dateError = form.getFieldState(`items.${index}.deliveryDate`).error;

  const vatRateInfo = getVatRatePercentage(vatRate);
  const vatAmount =
    calculateVatAmount(amount, vatIncluded, vatRateInfo.vatRatePercentage) ?? 0;
  const amountWithVat =
    calculateAmountWithVat(amount, vatAmount, vatIncluded) ?? 0;

  useEffect(() => {
    const value = quantity * price;
    setValue(`items.${index}.amount`, value ?? 0);
  }, [index, setValue, price, quantity]);

  return (
    <TableRow>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm ">{productName}</div>
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm bg-muted">
          {intlFormat.number(Number(rfqItem.quantity), {
            style: "decimal",
            minimumFractionDigits: 3,
          })}
        </div>
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
          <CellField
            control={form.control}
            name={`items.${index}.quantity`}
            type="number"
          />
        )}
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm bg-muted">
          {intlFormat.number(Number(rfqItem.price), {
            style: "decimal",
            minimumFractionDigits: 2,
          })}
        </div>
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
          <CellField
            control={form.control}
            name={`items.${index}.price`}
            type="number"
          />
        )}
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
          <div className="h-10 w-full px-3 py-2 text-sm ">
            {intlFormat.number(Number(amount), {
              style: "decimal",
              minimumFractionDigits: 2,
            })}
          </div>
        )}
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
          <FormField
            control={form.control}
            name={`items.${index}.vatRate`}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-none rounded-none focus:outline-none focus:ring-0 focus-visible:outline-0 focus-visible:outline-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-green-50 hover:dark:bg-green-900">
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
        )}
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
          <div className="h-10 w-full px-3 py-2 text-sm ">
            {intlFormat.number(Number(vatAmount), {
              style: "decimal",
              minimumFractionDigits: 2,
            })}
          </div>
        )}
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
          <div className="h-10 w-full px-3 py-2 text-sm ">
            {intlFormat.number(Number(amountWithVat), {
              style: "decimal",
              minimumFractionDigits: 2,
            })}
          </div>
        )}
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm bg-muted">
          <ClientDate date={rfqItem.deliveryDate} format="dd.MM.yyyy" />
        </div>
      </Cell>
      <Cell>
        {skip ? (
          <EmptyCell />
        ) : (
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
                          "border-none w-full pl-3 text-left font-normal hover:bg-green-50 hover:dark:bg-green-900",
                          !field.value && "text-muted-foreground",
                          dateError && "!bg-red-300"
                        )}
                      >
                        {field.value ? (
                          <ClientDate date={field.value} format="dd.MM.yyyy" />
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
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        )}
      </Cell>
      <Cell>
        <div className="h-10 max-w-xs px-3 py-2 text-sm bg-muted truncate overflow-hidden">
          {rfqItem.comment}
        </div>
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.comment`} />
      </Cell>
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm ">
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

export default memo(QuotationItem);
