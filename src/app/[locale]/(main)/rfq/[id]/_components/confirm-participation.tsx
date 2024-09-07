"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { Handshake } from "lucide-react";
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
import { useRouter } from "@/navigation";

type Props = {
  id: string;
};

const ConfirmParticipation = ({ id }: Props) => {
  const t = useTranslations("RFQ");

  const router = useRouter();

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const confirmParticipation = async () => {
    setLoading(true);

    const config = {
      method: "PATCH",
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
    };

    try {
      await request(`/api/rfq/${id}/participation`, config);

      toast({
        title: t("participationConfirmed"),
        description: t("participationConfirmedHint"),
      });

      setOpen(false);
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("participationError"),
        description: message,
        variant: "destructive",
      });
    }

    router.refresh();

    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="text-center whitespace-normal h-auto space-x-2 lg:w-full">
          <Handshake className="mr-2 h-4 w-4" />
          <span>{t("confirmParticipation")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("participationTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("participationSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={confirmParticipation}>
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmParticipation;
