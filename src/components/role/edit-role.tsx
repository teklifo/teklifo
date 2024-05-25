"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Prisma,
  Stock as StockType,
  PriceType as PriceTypeType,
  Company as CompanyType,
} from "@prisma/client";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Plus, Trash } from "lucide-react";
import AvailableData from "./available-data";
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

type RoleType = Prisma.CompanyRoleGetPayload<{
  include: { availableData: true; company: true };
}>;

type RoleFormProps = {
  role?: RoleType;
  company: CompanyType;
  stocks: StockType[];
  priceTypes: PriceTypeType[];
};

const RoleForm = ({ role, company, stocks, priceTypes }: RoleFormProps) => {
  const t = useTranslations("Role");

  const update = role !== undefined;

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.roleSchema");
  const formSchema = getRoleSchema(st);

  const defaultAvailableData: {
    stockId: string;
    priceTypes: [{ priceTypeId: string }];
  }[] = [];
  if (role) {
    role.availableData.forEach((data) => {
      const object = defaultAvailableData.find(
        (d) => d.stockId === data.stockId
      );
      if (object) {
        object.priceTypes.push({ priceTypeId: data.priceTypeId });
      } else {
        defaultAvailableData.push({
          stockId: data.stockId,
          priceTypes: [
            {
              priceTypeId: data.priceTypeId,
            },
          ],
        });
      }
    });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: update ? role.name : "",
      availableData: defaultAvailableData,
    },
  });

  const availableData = useFieldArray({
    control: form.control,
    name: "availableData",
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
        await request<RoleType>(
          `/api/company/${company.id}/role/${role.id}`,
          config
        );

        toast({
          title: t("roleIsUpdated"),
          description: t("roleIsUpdatedHint"),
        });
      } else {
        await request<RoleType>(`/api/company/${company.id}/role/`, config);

        toast({
          title: t("newRoleIsCreated"),
          description: t("newRoleHint"),
        });
      }

      window.location.href = `/roles`;
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
            {update ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
