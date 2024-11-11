import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ChevronLeft, FileInput } from "lucide-react";
import { UrlObject } from "url";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href: string | UrlObject;
};

const BackButton = ({ href }: BackButtonProps) => {
  const t = useTranslations("QuotationsCompare");

  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "space-x-2"
      )}
    >
      <ChevronLeft className="w-4 -h-4" />
    </Link>
  );
};

export default BackButton;
