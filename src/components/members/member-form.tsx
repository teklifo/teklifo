"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Prisma, CompanyRole } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Pencil } from "lucide-react";
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
import { getMemberSchema } from "@/lib/schemas";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type MemberType = Prisma.CompanyMembersGetPayload<{
  include: { user: true; companyRole: true };
}>;

type MemberFormProps = {
  companyId: string;
  member: MemberType;
};

type PaginatedData = {
  result: CompanyRole[];
  pagination: PaginationType;
};

const MemberForm = ({ companyId, member }: MemberFormProps) => {
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
  const formSchema = getMemberSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: member.userId,
      roleId: member.companyRoleId,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const config = {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify(values),
    };

    try {
      await request<MemberType>(
        `/api/company/${companyId}/member/${member.userId}`,
        config
      );

      toast({
        title: t("memberIdUpdated"),
        description: t("memberIdUpdatedHint"),
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
        <Button variant="ghost" className="flex justify-start">
          <Pencil className="mr-2 h-4 w-4" />
          <span>{t("edit")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("updateMemberTitle")}</DialogTitle>
          <DialogDescription>{t("updateMemberSubtitle")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <h4 className="text-sm font-medium leading-none">
            {member.user.email}
          </h4>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
              {t("update")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MemberForm;
