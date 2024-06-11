"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { ThumbsUp } from "lucide-react";
import { Company as CompanyType } from "@prisma/client";
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

type Props = {
  rfqId: string;
  company: CompanyType | null;
};

const ConfirmParticipation = ({ rfqId, company }: Props) => {
  const t = useTranslations("SupplierGuide");

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
      await request(`/api/rfq/${rfqId}/participation`, config);

      toast({
        title: t("participationConfirmed"),
        description: t("participationdHint"),
      });

      setOpen(false);

      window.location.href = `/rfq/${rfqId}`;
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("confirmError"),
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
          className="flex justify-center space-x-2 w-full"
          size="lg"
          disabled={!company}
        >
          <ThumbsUp />
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
