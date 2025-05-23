import { useTranslations, useLocale } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: CompanyType;
};

const CompanyCard = ({
  company: { id, tin, name, slogan, sloganRu },
}: CompanyCardProps) => {
  const t = useTranslations("Company");

  const currentLocale = useLocale();

  let sloganText = slogan;
  if (currentLocale === "ru" && sloganRu) {
    sloganText = sloganRu;
  }

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="line-clamp-1">{name}</CardTitle>
        <CardDescription>{`${t("tin")}: ${tin}`}</CardDescription>
      </CardHeader>
      <CardContent className="h-[150px]">
        <CardDescription className="line-clamp-5 break-words">
          {sloganText || t("noSlogan")}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/company/${id}`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          <span>{t("more")}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;
