import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
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
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/company/${id}`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          {t("more")}
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CompanyCard;
