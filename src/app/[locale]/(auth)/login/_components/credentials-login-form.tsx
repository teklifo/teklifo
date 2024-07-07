"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getCredentialsSchema } from "@/lib/schemas";

const CredentialsLoginForm = () => {
  const t = useTranslations("Login");

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.credentialsSchema");
  const formSchema = getCredentialsSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const result = await signIn("credentials", {
      callbackUrl: "/dashboard",
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result && result.error) {
      let message = "";

      if (result.error === "CredentialsSignin")
        message = t("invalidCredentials");
      else message = t("serverError");

      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    } else {
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  data-test="credentials-provider-email-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  data-test="credentials-provider-password-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
          data-test="credentials-provider-submit-btn"
        >
          {t("next")}
        </Button>
      </form>
    </Form>
  );
};

export default CredentialsLoginForm;
