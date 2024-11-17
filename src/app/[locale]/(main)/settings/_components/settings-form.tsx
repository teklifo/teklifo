"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User as UserType } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import DeleteUser from "./delete-user";
import { getUserSchema } from "@/lib/schemas";
import request from "@/lib/request";
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

type SettingsFormProps = {
  user: UserType;
};

const SettingsForm = ({ user }: SettingsFormProps) => {
  const t = useTranslations("Settings");

  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const st = useTranslations("Schemas.userSchema");
  const userSchema = getUserSchema(st);
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name ?? undefined,
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    setIsLoading(true);

    const config = {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify(values),
    };

    try {
      await request<UserType>(`/api/user/${user.id}`, config);

      toast({
        title: t("userIsUpdated"),
        description: t("userIsUpdatedHint"),
      });

      router.refresh();
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
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
          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between items-center">
            <Button type="submit" disabled={isLoading}>
              {t("update")}
            </Button>
            <DeleteUser userId={user.id} />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsForm;
