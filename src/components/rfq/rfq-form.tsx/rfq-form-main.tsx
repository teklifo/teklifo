import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronsUpDown } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { getRFQSchema } from "@/lib/schemas";
import { cn, dateFnsLocale } from "@/lib/utils";
import CURRENCIES from "@/lib/currencies";

const RFQFormMain = () => {
  const t = useTranslations("RFQForm");

  const locale = useLocale();

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const [currencyOpen, setCurrencyOpen] = useState(false);

  return (
    <div className="mt-4 space-y-4">
      {/* Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("title")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormDescription>{t("titleDescription")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* End date */}
      <div className="max-w-[240px]">
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("endDate")}</FormLabel>
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Currency*/}
      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("currency")}</FormLabel>
            <Popover
              open={currencyOpen}
              onOpenChange={setCurrencyOpen}
              modal={true}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-[240px]"
                  >
                    {field.value ? field.value : t("selectCurrency")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder={t("currencySearch")}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>{t("currencyNotFound")}</CommandEmpty>
                    <CommandGroup>
                      <div className="overflow-hidden">
                        {CURRENCIES.map((currency) => (
                          <CommandItem
                            value={currency}
                            key={currency}
                            onSelect={() => {
                              form.setValue("currency", currency);
                              setCurrencyOpen(false);
                            }}
                          >
                            {currency}
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Description*/}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea {...field} rows={5} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Private request */}
      <FormField
        control={form.control}
        name="privateRequest"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>{t("makePrivate")}</FormLabel>
              <FormDescription>{t("makePrivateHint")}</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default RFQFormMain;
