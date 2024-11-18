"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { Plus } from "lucide-react";
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

const CompanyRequired = ({ children }: Props) => {
  const t = useTranslations("CompanyRequired");

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("companyRequiredTitle")}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground my-6">{t("companyRequiredHint")}</p>
        <Link
          href={`/new-company`}
          className={cn(buttonVariants({ variant: "outline" }), "space-x-2")}
          target="_blank"
          onClick={() => setOpen(false)}
        >
          <Plus className="text-muted-foreground h-4 w-4" />
          <span>{t("createCompany")}</span>
        </Link>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyRequired;
