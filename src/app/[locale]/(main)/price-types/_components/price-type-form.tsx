"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PriceType as PriceTypeType } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Pencil, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
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
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getPriceTypeSchema } from "@/lib/schemas";
import request from "@/lib/request";
import CURRENCIES from "@/lib/currencies";

type PriceTypeFormProps = {
  companyId: String;
  priceType?: PriceTypeType;
};

const PriceTypeForm = ({ companyId, priceType }: PriceTypeFormProps) => {
  const t = useTranslations("PriceType");

  const update = priceType !== undefined;

  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.priceTypeSchema");
  const formSchema = getPriceTypeSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: update ? priceType.name : "",
      currency: update ? priceType.currency : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const config = {
      method: update ? "put" : "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify(values),
    };

    try {
      if (update) {
        await request<PriceTypeType>(
          `/api/company/${companyId}/price-type/${priceType.id}`,
          config
        );

        toast({
          title: t("priceTypeIsUpdated"),
          description: t("priceTypeIsUpdatedHint"),
        });
      } else {
        await request<PriceTypeType>(
          `/api/company/${companyId}/price-type`,
          config
        );

        toast({
          title: t("newPriceTypeIsCreated"),
          description: t("newPriceTypeHint"),
        });
      }

      form.reset();

      setOpen(false);

      router.refresh();
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: update ? t("updateError") : t("error"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {update ? (
          <Button variant="ghost" className="justify-start">
            <Pencil className="mr-2 h-4 w-4" />
            <span>{t("edit")}</span>
          </Button>
        ) : (
          <Button variant="default" className="space-x-2">
            <Plus />
            <span>{t("new")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {update ? t("updatePriceTypeTitle") : t("newPriceTypeTitle")}
          </DialogTitle>
          <DialogDescription>
            {update ? t("updatePriceTypeSubtitle") : t("newPriceTypeSubtitle")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        <Button variant="outline" role="combobox">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {update ? t("update") : t("create")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PriceTypeForm;
