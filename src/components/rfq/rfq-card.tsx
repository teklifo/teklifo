import { useLocale, useTranslations } from "next-intl";
import type { Prisma, Company as CompanyType } from "@prisma/client";
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
import { Separator } from "@/components/ui/separator";
import { cn, localizedRelativeDate } from "@/lib/utils";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
  };
}>;

type RFQCardProps = {
  rfq: RequestForQuotationType;
  currentCompany?: CompanyType;
};

const RFQCard = ({ rfq, currentCompany }: RFQCardProps) => {
  const t = useTranslations("RFQ");

  const locale = useLocale();

  const { id, number, title, company, createdAt } = rfq;

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{`${t("rfq")} #${number}`}</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px] space-y-4 p-4 pt-0 md:p-6 md:pt-0">
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
        <RFQDateInfo rfq={rfq} view="horizontal" />
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
