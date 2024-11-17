"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { getCookie } from "cookies-next";
import * as z from "zod";
import type { Prisma } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import { FileInput } from "lucide-react";
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
import { getRFQSchema } from "@/lib/schemas";
import request from "@/lib/request";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type ConfirmRFQProps = {
  rfq?: RFQType;
};

const ConfirmRFQ = ({ rfq }: ConfirmRFQProps) => {
  const t = useTranslations("RFQForm");
  const router = useRouter();

  const update = rfq !== undefined;
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);
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
        const updatedRfq = await request<RFQType>(`/api/rfq/${rfq.id}`, config);

        toast({
          title: t("rfqIsUpdated"),
          description: t("rfqIsUpdatedHint"),
        });

        window.location.href = `/rfq/${updatedRfq.id}`;
      } else {
        const newRfq = await request<RFQType>(`/api/rfq/`, config);

        toast({
          title: t("newRFQIsCreated"),
          description: t("newRFQHint"),
        });

        router.push(`/rfq/${newRfq.id}`);
        router.refresh();
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

    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="lg" className="space-x-2">
          <FileInput />
          <span>{rfq ? t("update") : t("create")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {rfq ? t("rfqConfirmTitleUpdate") : t("rfqConfirmTitleCreate")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("rfqConfirmSubtitle")}
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
            {rfq ? t("update") : t("create")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmRFQ;
