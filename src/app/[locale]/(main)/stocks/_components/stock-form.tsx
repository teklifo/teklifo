"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Stock as StockType } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Pencil } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getStockSchema } from "@/lib/schemas";
import request from "@/lib/request";

type StockFormProps = {
  companyId: String;
  stock?: StockType;
};

const StockForm = ({ companyId, stock }: StockFormProps) => {
  const t = useTranslations("Stock");

  const update = stock !== undefined;

  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.stockSchema");
  const formSchema = getStockSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: update ? stock.name : "",
    },
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
        await request<StockType>(
          `/api/company/${companyId}/stock/${stock.id}`,
          config
        );

        toast({
          title: t("stockIsUpdated"),
          description: t("stockIsUpdatedHint"),
        });
      } else {
        await request<StockType>(`/api/company/${companyId}/stock`, config);

        toast({
          title: t("newStockIsCreated"),
          description: t("newStockHint"),
        });
      }

      form.reset();

      setOpen(false);

      router.refresh();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {update ? (
          <Button variant="ghost" className="justify-start">
            <Pencil className="mr-2 h-4 w-4" />
            <span>{t("edit")}</span>
          </Button>
        ) : (
          <Button variant="default" className="space-x-2">
            <Plus />
            <span>{t("new")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {update ? t("updateStockTitle") : t("newStockTitle")}
          </DialogTitle>
          <DialogDescription>
            {update ? t("updateStockSubtitle") : t("newStockSubtitle")}
          </DialogDescription>
        </DialogHeader>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {update ? t("update") : t("create")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StockForm;
