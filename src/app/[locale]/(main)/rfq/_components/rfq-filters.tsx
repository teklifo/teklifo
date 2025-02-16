"use client";

import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { DefaultValues, useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { formatISO } from "date-fns";
import queryString from "query-string";
import { Company as CompanyType } from "@prisma/client";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CompanyFilter from "@/components/filters/company-filter";
import ClientDate from "@/components/client-date";
import { getRFQFiltersSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const rfqFiltersSchema = getRFQFiltersSchema((_) => {
  return "";
});

type RFQFiltersProps = {
  defaultFilters: DefaultValues<z.infer<typeof rfqFiltersSchema>>;
};

const RFQFilters = ({ defaultFilters }: RFQFiltersProps) => {
  const t = useTranslations("RFQSearch");

  const router = useRouter();

  const st = useTranslations("Schemas.rfqFiltersSchema");
  const rfqFiltersSchema = getRFQFiltersSchema(st);
  const form = useForm<z.infer<typeof rfqFiltersSchema>>({
    resolver: zodResolver(rfqFiltersSchema),
    defaultValues: defaultFilters,
  });

  const company = useWatch({
    control: form.control,
    name: "company",
  }) as CompanyType[];

  function setCompanyFilters(selectedCompanies: CompanyType[]) {
    form.setValue("company", selectedCompanies);
  }

  function resetFilters() {
    form.reset({
      company: [],
      endDateFrom: new Date(),
      endDateTo: undefined,
    });
    form.handleSubmit(onSubmit)();
  }

  async function onSubmit(values: z.infer<typeof rfqFiltersSchema>) {
    const queryParams = queryString.stringifyUrl(
      {
        url: "/",
        query: {
          companyId: values.company.map((company) => company.id),
          endDateFrom: values.endDateFrom && formatISO(values.endDateFrom),
          endDateTo: values.endDateTo && formatISO(values.endDateTo),
        },
      },
      {
        skipNull: true,
        arrayFormat: "comma",
      }
    );

    router.push(`/rfq${queryParams}`);
  }

  return (
    <div className="mt-8 px-0 py-8 md:px-4">
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
              name="endDateTo"
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
                            <ClientDate
                              date={field.value}
                              format="dd.MM.yyyy HH:mm"
                            />
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
                      />
                      <div className="p-3 border-t border-border">
                        <TimePicker
                          setDate={field.onChange}
                          date={field.value}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Button type="submit" size="sm">
              {t("search")}
            </Button>
            <Button
              type="reset"
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              {t("clear")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RFQFilters;
