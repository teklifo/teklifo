"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Product as ProductType } from "@prisma/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getProductSchema } from "@/lib/schemas";
import request from "@/lib/request";

type ProductFormProps = {
  product?: ProductType;
};

const ProductForm = ({ product }: ProductFormProps) => {
  const t = useTranslations("ProductForm");
  const router = useRouter();

  const update = product !== undefined;

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const st = useTranslations("Schemas.productSchema");
  const productSchema = getProductSchema(st);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: product?.id ?? undefined,
      name: product?.name ?? "",
      number: product?.number ?? "",
      unit: product?.unit ?? "",
      brand: product?.brand ?? "",
      brandNumber: product?.brandNumber ?? "",
      description: product?.description ?? "",
      externalId: product?.externalId ?? "",
      archive: product?.archive ?? false,
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    setIsLoading(true);

    const config = {
      method: update ? "put" : "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify([values]),
    };

    try {
      if (update) {
        const products = await request<ProductType[]>(
          `/api/product/${product.id}`,
          config
        );

        toast({
          title: t("productIsUpdated"),
          description: t("productIsUpdatedHint"),
        });

        router.push(`/products/${products[0].id}`);
        router.refresh();
      } else {
        const products = await request<ProductType[]>("/api/product", config);

        toast({
          title: t("newProductIsCreated"),
          description: t("newProductHint"),
        });

        router.push(`/products/${products[0].id}`);
        router.refresh();
      }
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

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Number */}
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("number")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Unit */}
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("unit")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Brand */}
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("brand")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Brand number */}
        <FormField
          control={form.control}
          name="brandNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("brandNumber")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* External ID */}
        <FormField
          control={form.control}
          name="externalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("externalId")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Archive */}
        <div className="relative">
          <FormField
            control={form.control}
            name="archive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>{t("archive")}</FormLabel>
                  <FormDescription>{t("archiveHint")}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full space-x-2">
          {update ? t("update") : t("create")}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
