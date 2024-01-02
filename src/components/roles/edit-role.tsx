"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Stock as StockType,
  PriceType as PriceTypeType,
  CompanyRole as RoleType,
} from "@prisma/client";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash } from "lucide-react";
import AvailableData from "@/components/roles/available-data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getRoleSchema } from "@/lib/schemas";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type RoleFormProps = {
  companyId: string;
};

type StockPaginatedData = {
  result: StockType[];
  pagination: PaginationType;
};

type PriceTypePaginatedData = {
  result: PriceTypeType[];
  pagination: PaginationType;
};

const RoleForm = ({ companyId }: RoleFormProps) => {
  const t = useTranslations("Role");

  const router = useRouter();
  const { toast } = useToast();
  const [stocks, setStocks] = useState<StockType[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceTypeType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getStocksAndPriceTypes = async (companyId: string) => {
      const config = {
        method: "get",
        headers: {
          "Accept-Language": getCookie("NEXT_LOCALE"),
        },
        next: { revalidate: 0 },
      };

      try {
        const results = await Promise.all([
          await request<StockPaginatedData>(
            `/api/company/${companyId}/stock?page=1&limit=100`,
            config
          ),

          await request<PriceTypePaginatedData>(
            `/api/company/${companyId}/price-type?page=1&limit=100`,
            config
          ),
        ]);

        setStocks(results[0].result);
        setPriceTypes(results[1].result);
      } catch (error) {
        //
      }
    };

    getStocksAndPriceTypes(companyId);
  }, [companyId]);

  const st = useTranslations("Schemas.roleSchema");
  const formSchema = getRoleSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      availableData: [],
    },
  });

  const availableData = useFieldArray({
    control: form.control,
    name: "availableData",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const config = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify(values),
    };

    try {
      await request<RoleType>(`/api/company/${companyId}/role/`, config);

      toast({
        title: t("newRoleIsCreated"),
        description: t("newRoleHint"),
      });

      form.reset();

      router.push(`/company/${companyId}/roles`);
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("updateError"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
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
        {availableData.fields.map((dataField, index) => (
          <Card key={dataField.id} className="h-full w-full">
            <CardHeader className="flex flex-row items-center space-x-8">
              <CardTitle>
                {dataField.stockId
                  ? stocks.find((s) => s.id === dataField.stockId)?.name
                  : t("access")}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => availableData.remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <AvailableData
                stocks={stocks}
                priceTypes={priceTypes}
                index={index}
              />
            </CardContent>
          </Card>
        ))}
        <div className="flex flex-col items-start space-y-8">
          <div className="flex flex-col space-x-0 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <Button
              type="button"
              variant="outline"
              className="space-x-2"
              onClick={() =>
                availableData.append({ stockId: "", priceTypes: [] })
              }
            >
              <Plus />
              <span>{t("addStock")}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                availableData.fields.forEach((f, fi) =>
                  availableData.remove(fi)
                );

                const priceArray = priceTypes.map((p) => {
                  return { priceTypeId: p.id };
                });

                stocks.forEach((s) =>
                  availableData.append({
                    stockId: s.id,
                    priceTypes: priceArray,
                  })
                );
              }}
            >
              <span>{t("addAll")}</span>
            </Button>
          </div>
          <Button type="submit" disabled={loading}>
            {t("update")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
