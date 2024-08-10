"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { getCookie } from "cookies-next";
import { Trash } from "lucide-react";
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
import request from "@/lib/request";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type Props = {
  quotation: QuotationType;
};

const DeleteQuotation = ({ quotation }: Props) => {
  const t = useTranslations("Quotation");

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id } = quotation;

  const deleteQuotation = async () => {
    setLoading(true);

    const config = {
      method: "delete",
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
    };

    try {
      await request(`/api/quotation/${id}`, config);

      toast({
        title: t("quotationDeleted"),
        description: t("quotationDeletedHint"),
      });

      setOpen(false);

      window.location.href = "/outgoing-quotation";
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("deleteError"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="justify-start">
          <Trash className="mr-2 h-4 w-4" />
          <span>{t("delete")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("quotationDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("quotationDeleteSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={deleteQuotation}>
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteQuotation;
