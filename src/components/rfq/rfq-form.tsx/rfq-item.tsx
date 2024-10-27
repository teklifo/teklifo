import { useState } from "react";
import { Product as ProductType } from "@prisma/client";
import { useTranslations, useFormatter } from "next-intl";
import {
  Control,
  ControllerRenderProps,
  useFormContext,
} from "react-hook-form";
import * as z from "zod";
import { MoreHorizontal, Trash, X, CalendarIcon } from "lucide-react";
import ProductSelect from "@/components/product/product-select";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  FormControl,
  FormField,
  FormItem,
  useFormField,
} from "@/components/ui/form";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRFQSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type RFQItemProps = {
  index: number;
  removeProduct: () => void;
};

interface CellFieldProps extends React.ComponentPropsWithoutRef<"input"> {
  control: Control<any>;
  name: string;
}

interface TableInputProps extends React.ComponentPropsWithoutRef<"input"> {
  field: ControllerRenderProps<any, string>;
}

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <TableCell className="p-0 border-none">{children}</TableCell>;
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

const RFQItem = ({ index, removeProduct }: RFQItemProps) => {
  const t = useTranslations("RFQForm");
  const format = useFormatter();

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  const [openProducts, setOpenProducts] = useState(false);

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
    <TableRow className="border-none">
      <Cell>
        <div className="flex flex-row justify-start items-center">
          {productSelected ? (
            <div className="h-10 w-full px-3 py-2 text-sm border-input border">
              {form.getValues(`items.${index}.product`)?.name}
            </div>
          ) : (
            <div className="w-full">
              <CellField
                control={form.control}
                name={`items.${index}.productName`}
              />
            </div>
          )}
          <div className="flex flex-row">
            <Tooltip delayDuration={1000}>
              <Dialog open={openProducts} onOpenChange={setOpenProducts}>
                <DialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-fit space-x-2 border-input border rounded-none"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                </DialogTrigger>
                <ProductSelect onSelect={onProductSelect} />
              </Dialog>
              <TooltipContent side="bottom" className="flex items-center gap-4">
                {t("selectProduct")}
              </TooltipContent>
            </Tooltip>
            {productSelected && (
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-fit space-x-2 border-input border rounded-none"
                    onClick={onProductRemove}
                  >
                    <X className="w-3 h-3" />
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
      </Cell>
      <Cell>
        <CellField
          control={form.control}
          name={`items.${index}.quantity`}
          type="number"
        />
      </Cell>
      <Cell>
        <CellField
          control={form.control}
          name={`items.${index}.price`}
          type="number"
        />
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
                        format.dateTime(new Date(field.value), {
                          dateStyle: "medium",
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
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="h-10 flex justify-center items-center border-input border">
              <Button type="button" variant="ghost" onClick={removeProduct}>
                <Trash className="w-3 h-3" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-4">
            {t("deleteItem")}
          </TooltipContent>
        </Tooltip>
      </Cell>
    </TableRow>
  );
};

export default RFQItem;
