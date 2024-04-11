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
import getAuthCallbackUrl from "@/app/actions/get-auth-callback-url";

const LoginForm = () => {
  const t = useTranslations("Login");

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email(t("invalidEmail")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const callbackUrl = await getAuthCallbackUrl(values.email);

    const result = await signIn("email", {
      callbackUrl,
      email: values.email,
      redirect: true,
    });

    if (result && result.error) {
      let message = "";

      message = String(result.error);

      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {t("next")}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
