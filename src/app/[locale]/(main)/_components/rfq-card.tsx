import Link from "next/link";
import { useTranslations } from "next-intl";
import type { RequestForQuotation as RequestForQuotationType } from "@prisma/client";
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

type RFQCardProps = {
  rfq: RequestForQuotationType;
};

const RFQCard = ({
  rfq: { id, startDate, endDate, description },
}: RFQCardProps) => {
  const t = useTranslations("Company");

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{id}</CardTitle>
        <CardDescription className="line-clamp-5 break-all">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/rfq/${id}`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          <span>{t("more")}</span>
          <ArrowRight />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RFQCard;
