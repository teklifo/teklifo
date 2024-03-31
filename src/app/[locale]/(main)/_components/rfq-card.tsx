import Link from "next/link";
import { useTranslations } from "next-intl";
import type { RequestForQuotation as RequestForQuotationType } from "@prisma/client";
import { format } from "date-fns";
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
  rfq: { id, number, startDate, endDate, publicRequest, description },
}: RFQCardProps) => {
  const t = useTranslations("RFQ");

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="line-clamp-1">{`${t(
          "rfq"
        )} #${number}`}</CardTitle>
        <div className="text-sm text-muted-foreground line-clamp-5 break-words space-y-1">
          <span>{publicRequest ? t("public") : t("private")}</span>
          <div className="flex flex-row space-x-2">
            <span className="font-bold">{`${t("period")}:`}</span>
            <span>
              {`${format(startDate, "dd.MM.yyyy")} - ${format(
                endDate,
                "dd.MM.yyyy"
              )}`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[150px]">
        <CardDescription className="line-clamp-5 break-words">
          {description || t("noDescription")}
        </CardDescription>
      </CardContent>
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
