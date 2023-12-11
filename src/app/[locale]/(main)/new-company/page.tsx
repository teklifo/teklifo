"use client";

import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getCompanySchema } from "@/lib/schemas";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const NewCompany = () => {
  const t = useTranslations("NewCompany");

  const st = useTranslations("Schemas.companySchema");
  const companySchema = getCompanySchema(st);
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      tin: "",
      description: "",
      descriptionRu: "",
      slogan: "",
      sloganRu: "",
    },
  });

  function onSubmit(values: z.infer<typeof companySchema>) {
    console.log(values);
  }

  return (
    <MaxWidthWrapper className="my-8">
      <h1 className="text-4xl font-bold tracking-tight mb-4">{t("title")}</h1>
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* TIN */}
          <FormField
            control={form.control}
            name="tin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("tin")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Tabs defaultValue="azerbaijani">
            <TabsList>
              <TabsTrigger value="azerbaijani">{t("azerbaijani")}</TabsTrigger>
              <TabsTrigger value="russian">{t("russian")}</TabsTrigger>
            </TabsList>
            <TabsContent value="azerbaijani" className="space-y-6">
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
              {/* Slogan */}
              <FormField
                control={form.control}
                name="slogan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("slogan")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="russian" className="space-y-6">
              {/* Description RU*/}
              <FormField
                control={form.control}
                name="descriptionRu"
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
              {/* Slogan RU*/}
              <FormField
                control={form.control}
                name="sloganRu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("slogan")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
          <Button type="submit">{t("create")}</Button>
        </form>
      </Form>
    </MaxWidthWrapper>
  );
};

export default NewCompany;
