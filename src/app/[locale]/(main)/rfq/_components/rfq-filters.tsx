"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import queryString from "query-string";
import { Company as CompanyType } from "@prisma/client";
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
import { useRouter } from "@/navigation";

const RFQFilters = () => {
  const t = useTranslations("RFQSearch");

  const router = useRouter();

  const st = useTranslations("Schemas.rfqFiltersSchema");
  const rfqFiltersSchema = getRFQFiltersSchema(st);
  const form = useForm<z.infer<typeof rfqFiltersSchema>>({
    resolver: zodResolver(rfqFiltersSchema),
    defaultValues: {
      company: [],
    },
  });

  const company = useWatch({
    control: form.control,
    name: "company",
  }) as CompanyType[];

  function setCompanyFilters(selectedCompanies: CompanyType[]) {
    form.setValue("company", selectedCompanies);
  }

  async function onSubmit(values: z.infer<typeof rfqFiltersSchema>) {
    const queryParams = queryString.stringify(
      {
        company: values.company.map((company) => company.tin),
        endDateFrom:
          values.endDate && format(values.endDate?.from, "dd-MM-yyyy"),
        endDateTo: values.endDate && format(values.endDate?.to, "dd-MM-yyyy"),
      },
      { arrayFormat: "comma" }
    );

    router.push(`/rfq?${queryParams}`);
  }

  return (
    <div className="fixed top-0 h-full w-full overflow-hidden">
      <div className="mt-16 px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("filters")}
            </h4>
            {/* Company */}
            <CompanyFilter
              defaultValues={company}
              onSaveCallback={setCompanyFilters}
            />
            {/* Period */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-end md:justify-start md:space-x-8">
              <FormField
                control={form.control}
                name={`endDate`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("endDate")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="endDate"
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
