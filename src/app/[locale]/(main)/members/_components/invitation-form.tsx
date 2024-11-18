"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanyRole, Invitation } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Send } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getInvitationSchema } from "@/lib/schemas";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import { Input } from "@/components/ui/input";

type InvitationFormProps = {
  companyId: string;
};

type PaginatedData = {
  result: CompanyRole[];
  pagination: PaginationType;
};

const InvitationForm = ({ companyId }: InvitationFormProps) => {
  const t = useTranslations("Member");

  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getRoles = async (companyId: string) => {
      const config = {
        method: "get",
        headers: {
          "Accept-Language": getCookie("NEXT_LOCALE"),
        },
        next: { revalidate: 0 },
      };

      try {
        const response = await request<PaginatedData>(
          `/api/company/${companyId}/role?page=1&limit=100`,
          config
        );
        setRoles(response.result);
      } catch (error) {
        //
      }
    };

    getRoles(companyId);
  }, [companyId]);

  const st = useTranslations("Schemas.memberSchema");
  const formSchema = getInvitationSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
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
      const result = await request<Invitation>(
        `/api/company/${companyId}/invitation`,
        config
      );

      await signIn("email", {
        email: values.email,
        redirect: false,
        callbackUrl: `/invitation/${result.id}`,
      });

      toast({
        title: t("invitationIsSent"),
        description: t("invitationIsSentHint"),
      });

      form.reset();

      setOpen(false);

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

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="space-x-2">
          <Plus />
          <span>{t("add")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("newMemberTitle")}</DialogTitle>
          <DialogDescription>{t("newMemberSubtitle")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectARole")} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full space-x-2"
              disabled={loading}
            >
              <span>{t("send")}</span>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationForm;
