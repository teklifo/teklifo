"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { LogIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const AuthRequired = ({ children }: Props) => {
  const t = useTranslations("AuthRequired");

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("authRequiredTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground my-6">{t("authRequiredHint")}</p>
        <Link
          href={`/login`}
          className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
          target="_blank"
          onClick={() => setOpen(false)}
        >
          <LogIn className="h-4 w-4" />
          <span>{t("login")}</span>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default AuthRequired;
