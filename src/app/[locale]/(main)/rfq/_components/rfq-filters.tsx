"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
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
import CompanyFilter from "@/components/filters/company-filter";
import { getRFQFiltersSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const RFQFilters = () => {
  const t = useTranslations("RFQSearch");

  const st = useTranslations("Schemas.rfqFiltersSchema");
  const rfqFiltersSchema = getRFQFiltersSchema(st);
  const form = useForm<z.infer<typeof rfqFiltersSchema>>({
    resolver: zodResolver(rfqFiltersSchema),
  });

  const onSubmit = async (values: z.infer<typeof rfqFiltersSchema>) => {};

  return (
    <div className="fixed top-0 h-full w-full overflow-hidden">
      <div className="mt-16 px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("filters")}
            </h4>
            {/* Company */}
            <CompanyFilter />
            {/* Period */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-end md:justify-start md:space-x-8">
              <FormField
                control={form.control}
                name={`date`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("date")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "dd.MM.yyyy")} -{" "}
                                {format(field.value.to, "dd.MM.yyyy")}
                              </>
                            ) : (
                              format(field.value.from, "dd.MM.yyyy")
                            )
                          ) : (
                            <span>{t("pickDate")}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field?.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" size="sm" data-test="submit">
              {t("search")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RFQFilters;
