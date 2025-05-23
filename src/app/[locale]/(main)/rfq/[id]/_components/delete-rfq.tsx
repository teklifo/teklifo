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

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: {
      select: {
        id: true;
        name: true;
      };
    };
    items: {
      include: {
        product: true;
      };
    };
    participants: true;
  };
}>;

type Props = {
  rfq: RequestForQuotationType;
};

const DeleteRFQ = ({ rfq }: Props) => {
  const t = useTranslations("RFQ");

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id } = rfq;

  const deleteRFQ = async () => {
    setLoading(true);

    const config = {
      method: "delete",
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
    };

    try {
      await request(`/api/rfq/${id}`, config);

      toast({
        title: t("rfqDeleted"),
        description: t("rfqDeletedHint"),
      });

      setOpen(false);

      window.location.href = "/my-rfq";
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
        <Button
          variant="outline"
          className="text-center whitespace-normal h-auto space-x-2 lg:w-full"
        >
          <Trash className="h-4 w-4" />
          <span>{t("delete")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("rfqDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("rfqDeleteSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={deleteRFQ}>
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRFQ;
