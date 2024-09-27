"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
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

type Props = {
  company: CompanyType;
};

const DeleteCompany = ({ company }: Props) => {
  const t = useTranslations("Company");

  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { id, name, tin } = company;

  const deleteRFQ = async () => {
    setLoading(true);

    const config = {
      method: "delete",
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
    };

    try {
      await request(`/api/company/${id}`, config);

      toast({
        title: t("companyDeleted"),
        description: t("companyDeletedHint"),
      });

      setOpen(false);

      deleteCookie("user-company");

      window.location.href = "/my-companies";
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
          className="justify-start"
          data-test="delete-company"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>{t("delete")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("companyDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("companyDeleteSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={deleteRFQ}
            data-test="confirm-delete-company"
          >
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCompany;
