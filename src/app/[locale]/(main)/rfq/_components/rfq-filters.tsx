"use client";

import { useRouter } from "@/navigation";
import { useFormatter, useTranslations } from "next-intl";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CompanyFilter from "@/components/filters/company-filter";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { getRFQFiltersSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const rfqFiltersSchema = getRFQFiltersSchema((_) => {
  return "";
});

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type RFQFiltersProps = {
  defaultFilters: DefaultValues<z.infer<typeof rfqFiltersSchema>>;
};

const RFQFilters = ({ defaultFilters }: RFQFiltersProps) => {
  const t = useTranslations("RFQSearch");
  const format = useFormatter();

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
      endDate: undefined,
    });
    form.handleSubmit(onSubmit)();
  }

  async function onSubmit(values: z.infer<typeof rfqFiltersSchema>) {
    const queryParams = queryString.stringifyUrl(
      {
        url: "/",
        query: {
          companyId: values.company.map((company) => company.id),
          endDate: values.endDate && formatISO(values.endDate),
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
    <div className="mt-8 px-4 py-8">
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
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    timezone={timeZone}
                    renderTrigger={({ value }) => (
                      <Button
                        id="endDate"
                        variant={"outline"}
                        className={cn(
                          "max-w-[300px] justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? (
                          format.dateTime(new Date(value), {
                            timeZone,
                            dateStyle: "medium",
                            timeStyle: "medium",
                          })
                        ) : (
                          <span>{t("pickDate")}</span>
                        )}
                      </Button>
                    )}
                  />

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
