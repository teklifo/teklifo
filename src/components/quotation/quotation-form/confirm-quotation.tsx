"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import * as z from "zod";
import type { Prisma } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import { BriefcaseBusiness } from "lucide-react";
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
import { getQuotationSchema } from "@/lib/schemas";
import request from "@/lib/request";
import { useRouter } from "next/navigation";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type ConfirmQuotationProps = {
  closeDialog: () => void;
  quotation?: QuotationType;
};

const ConfirmQuotation = ({
  quotation,
  closeDialog,
}: ConfirmQuotationProps) => {
  const t = useTranslations("Quotation");

  const router = useRouter();

  const update = quotation !== undefined;
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
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
      method: update ? "put" : "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify(values),
    };

    try {
      if (update) {
        await request<QuotationType>(`/api/quotation/${quotation.id}`, config);

        toast({
          title: t("quotationIsUpdated"),
          description: t("quotationIsUpdatedHint"),
        });
      } else {
        await request<QuotationType>(`/api/quotation/`, config);

        toast({
          title: t("newQuotationIsCreated"),
          description: t("newQuotationHint"),
        });
      }

      closeDialog();
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

    router.refresh();

    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="space-x-2">
          <BriefcaseBusiness className="h-4 w-4" />
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
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            {t("send")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmQuotation;
