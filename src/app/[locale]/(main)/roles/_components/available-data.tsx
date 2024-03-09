import { useTranslations } from "next-intl";
import type {
  Stock as StockType,
  PriceType as PriceTypeType,
} from "@prisma/client";
import { useFormContext, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { ChevronsUpDown, Check, Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getRoleSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type AvailableDataProps = {
  stocks: StockType[];
  priceTypes: PriceTypeType[];
  index: number;
};

const AvailableData = ({ stocks, priceTypes, index }: AvailableDataProps) => {
  const t = useTranslations("Role");

  const st = useTranslations("Schemas.roleSchema");
  const formSchema = getRoleSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  const availableData = useFieldArray({
    control: form.control,
    name: `availableData.${index}.priceTypes`,
  });

  return (
    <div className="flex flex-col space-x-0 space-y-8 md:flex-row md:justify-between md:space-y-0 md:space-x-8">
      {/* Stock */}
      <div className="md:w-[50%]">
        <FormField
          control={form.control}
          name={`availableData.${index}.stockId`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t("stock")}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? stocks.find((stock) => stock.id === field.value)?.name
                        : t("selectStock")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder={t("stockSearch")} />
                    <CommandEmpty>{t("noStocks")}</CommandEmpty>
                    <CommandGroup>
                      {stocks.map((stock) => (
                        <CommandItem
                          value={stock.id}
                          key={stock.id}
                          onSelect={() => {
                            form.setValue(
                              `availableData.${index}.stockId`,
                              stock.id
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              stock.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {stock.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <Separator orientation="vertical" className="hidden md:block md:h-auto" />
      <Separator orientation="horizontal" className="block md:hidden" />
      {/* Price types */}
      <div className="flex flex-col justify-start items-start space-y-4 md:w-[50%]">
        <Button
          type="button"
          variant="outline"
          className="space-x-2"
          onClick={() => availableData.append({ priceTypeId: "" })}
        >
          <Plus />
          <span>{t("addPriceType")}</span>
        </Button>
        {availableData.fields.map((item, i) => (
          <div key={item.id} className="w-full">
            <FormField
              control={form.control}
              name={`availableData.${index}.priceTypes.${i}.priceTypeId`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("priceType")}</FormLabel>
                  <div className="flex flex-row justify-center items-center space-x-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? priceTypes.find(
                                  (priceType) => priceType.id === field.value
                                )?.name
                              : t("selectPriceType")}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder={t("priceTypeSearch")} />
                          <CommandEmpty>{t("noStocks")}</CommandEmpty>
                          <CommandGroup>
                            {priceTypes.map((priceType) => (
                              <CommandItem
                                value={priceType.id}
                                key={priceType.id}
                                onSelect={() => {
                                  form.setValue(
                                    `availableData.${index}.priceTypes.${i}.priceTypeId`,
                                    priceType.id
                                  );
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    priceType.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {priceType.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => availableData.remove(i)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableData;
