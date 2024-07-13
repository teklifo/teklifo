import { useLocale, useTranslations } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { Building2, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "@/navigation";
import {
  QuotationCurrency,
  RFQDateInfo,
  RFQType,
} from "@/components/rfq/rfq-main-info";
import CompanyInfo from "@/components/company/company-info";
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, localizedRelativeDate } from "@/lib/utils";
import { RFQWithQuotationsType } from "@/types";

type RFQCardProps = {
  rfq: RFQWithQuotationsType;
  currentCompany?: CompanyType;
};

const RFQCard = ({ rfq, currentCompany }: RFQCardProps) => {
  const t = useTranslations("RFQ");

  const locale = useLocale();

  const { id, number, title, company, createdAt, _count } = rfq;

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{`${t("rfq")} #${number}`}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px] space-y-4 p-4 pt-0 md:p-6 md:pt-0">
        {currentCompany?.id === rfq.company.id ? (
          <Badge>
            {`${t("quotationsRecieved", {
              count: _count.quotations,
            })}`}
          </Badge>
        ) : (
          <>{_count.quotations && <Badge>{t("quotationsIsSent")}</Badge>}</>
        )}
        {currentCompany?.id === rfq.company.id ? (
          <CompanyInfo
            company={company}
            icon={<Briefcase />}
            title={t("quotationCompany")}
            view="horizontal"
          />
        ) : (
          <CompanyInfo
            company={rfq.company}
            icon={<Building2 />}
            title={t("requestCompany")}
            view="horizontal"
          />
        )}
        <Separator />
        <RFQType privateRequest={rfq.privateRequest} />
        <Separator />
        <RFQDateInfo endDate={rfq.endDate} view="horizontal" />
        <Separator />
        <QuotationCurrency currency={rfq.currency} view="horizontal" />
        <Separator />
        <CardDescription>
          {`${t("updatedAt")}: ${localizedRelativeDate(
            new Date(createdAt),
            new Date(),
            locale
          )}`}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-center md:justify-start">
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
