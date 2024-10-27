"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { getCookie } from "cookies-next";
import * as z from "zod";
import { useFormContext } from "react-hook-form";
import { Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getStockBalanceSchema } from "@/lib/schemas";
import request from "@/lib/request";

type ConfirmStockBalanceProps = {
  productId: number;
};

const ConfirmStockBalance = ({ productId }: ConfirmStockBalanceProps) => {
  const t = useTranslations("StockBalance");
  const router = useRouter();

  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.stockBalanceSchema");
  const formSchema = getStockBalanceSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const onOpenChange = async (openAlert: boolean) => {
    if (openAlert) {
      const validationResult = await form.trigger();
      if (!validationResult) return;
    }
    setOpen(openAlert);
  };

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
      await request("/api/stock-balance", config);

      toast({
        title: t("stockBalanceSaved"),
        description: t("stockBalanceSavedHint"),
      });

      router.push(`/products/${productId}`);
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="space-x-2">
          <Save />
          <span>{t("save")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("saveStockBalanceTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("saveStockBalanceSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {t("save")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmStockBalance;
