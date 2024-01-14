"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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

type Props = {
  userId: string;
};

const DeleteUser = ({ userId }: Props) => {
  const t = useTranslations("Settings");

  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteUser = async () => {
    setLoading(true);

    const config = {
      method: "delete",
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
    };

    try {
      await request(`/api/user/${userId}`, config);

      toast({
        title: t("userDeleted"),
        description: t("userDeletedHint"),
      });

      setOpen(false);

      router.refresh();
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
        <Button variant="destructive" className="justify-start">
          <Trash className="mr-2 h-4 w-4" />
          <span>{t("delete")}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("userDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("userDeleteSubtitle")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={deleteUser}>
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUser;
