import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MyCompanies = () => {
  const t = useTranslations("MyCompanies");

  return (
    <MaxWidthWrapper className="mt-8">
      <Link
        href="/new-company"
        className={cn("space-x-2", buttonVariants({ variant: "default" }))}
      >
        <Plus />
        <span>{t("newCompany")}</span>
      </Link>
    </MaxWidthWrapper>
  );
};

export default MyCompanies;
