"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie, setCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Company as CompanyType } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle2 } from "lucide-react";
import { getCompanySchema } from "@/lib/schemas";
import request from "@/lib/request";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type CompanyFormProps = {
  company?: CompanyType;
};

const CompanyForm = ({ company }: CompanyFormProps) => {
  const t = useTranslations("CompanyForm");

  const update = company !== undefined;

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const st = useTranslations("Schemas.companySchema");
  const companySchema = getCompanySchema(st);
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          id: company.id,
          name: company.name,
          tin: company.tin,
          description: company.description,
          descriptionRu: company.descriptionRu || "",
          slogan: company.slogan || "",
          sloganRu: company.sloganRu || "",
        }
      : {
          id: "",
          name: "",
          tin: "",
          description: "",
          descriptionRu: "",
          slogan: "",
          sloganRu: "",
        },
  });

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    setIsLoading(true);

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
        const updatedCompany = await request<CompanyType>(
          `/api/company/${company.id}`,
          config
        );

        toast({
          title: t("companyIsUpdated"),
          description: t("companyIsUpdatedHint"),
        });

        setCookie("user-company", company.id, {
          expires: new Date(3999, 1, 1),
        });
        window.location.href = `/company/${updatedCompany.id}`;
      } else {
        const newCompany = await request<CompanyType>("/api/company", config);

        toast({
          title: t("newCompanyIsCreated"),
          description: t("newCompanyHint"),
        });

        setCookie("user-company", newCompany.id, {
          expires: new Date(3999, 1, 1),
        });
        window.location.href = `/company/${newCompany.id}`;
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
        {/* ID */}
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("id")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" data-test="id" />
              </FormControl>
              <FormDescription>{t("idDescription")}</FormDescription>
              <FormMessage data-test="id-error" />
            </FormItem>
          )}
        />
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" data-test="name" />
              </FormControl>
              <FormMessage data-test="name-error" />
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
                <Input {...field} autoComplete="off" data-test="tin" />
              </FormControl>
              <FormMessage data-test="tin-error" />
            </FormItem>
          )}
        />
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" data-test="email" />
              </FormControl>
              <FormMessage data-test="email-error" />
            </FormItem>
          )}
        />
        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("phone")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" data-test="phone" />
              </FormControl>
              <FormMessage data-test="phone-error" />
            </FormItem>
          )}
        />
        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("website")}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" data-test="website" />
              </FormControl>
              <FormMessage data-test="website-error" />
            </FormItem>
          )}
        />
        <Tabs defaultValue="english">
          <TabsList>
            <TabsTrigger value="english">{t("english")}</TabsTrigger>
            <TabsTrigger value="russian">{t("russian")}</TabsTrigger>
          </TabsList>
          <TabsContent value="english" className="space-y-6">
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} data-test="description" />
                  </FormControl>
                  <FormMessage data-test="description-error" />
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
                    <Input {...field} autoComplete="off" data-test="slogan" />
                  </FormControl>
                  <FormMessage data-test="slogan-error" />
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
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full space-x-2"
          data-test="submit"
        >
          <CheckCircle2 />
          <span>{update ? t("update") : t("create")}</span>
        </Button>
      </form>
    </Form>
  );
};

export default CompanyForm;
