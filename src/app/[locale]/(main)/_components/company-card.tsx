import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { ArrowRight } from "lucide-react";
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
  company: { id, name, slogan, sloganRu },
}: CompanyCardProps) => {
  const t = useTranslations("Company");

  const currentLocale = useLocale();

  let description = slogan;
  if (currentLocale === "ru" && sloganRu) {
    description = sloganRu;
  }

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription className="line-clamp-5 break-all">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/company/${id}`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          <span>{t("more")}</span>
          <ArrowRight />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;
