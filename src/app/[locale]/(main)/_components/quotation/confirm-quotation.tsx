"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { useFormContext } from "react-hook-form";
import { Receipt } from "lucide-react";
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
import { getQuotationSchema } from "@/lib/schemas";

const ConfirmQuotation = () => {
  const t = useTranslations("QuotationForm");

  const [open, setOpen] = useState(false);

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const onOpenChange = async (openAlert: boolean) => {
    console.log(openAlert);
    if (openAlert) {
      const validationResult = await form.trigger();
      if (!validationResult) return;
    }
    setOpen(openAlert);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="w-full space-x-2">
          <Receipt />
          <span>{t("sendQuotation")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("quotationConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("quotationConfirmSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={() => {}}>{t("send")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmQuotation;
