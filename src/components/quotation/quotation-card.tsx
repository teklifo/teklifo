import { useLocale, useTranslations } from "next-intl";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import { Building2, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "@/navigation";
import { QuotationBase, QuotationTotal } from "./quotation-main-info";
import { RFQDateInfo } from "@/components/rfq/rfq-main-info";
import CompanyInfo from "@/components/company/company-info";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, localizedRelativeDate } from "@/lib/utils";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
  };
}>;

type QuotationCardProps = {
  quotation: QuotationType;
  currentCompany?: CompanyType;
};

const QuotationCard = ({ quotation, currentCompany }: QuotationCardProps) => {
  const t = useTranslations("Quotation");

  const locale = useLocale();

  const { id, company, rfq, updatedAt } = quotation;

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{`${t("quotation")} #${id}`}</CardTitle>
        <QuotationBase rfq={rfq} />
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
        <RFQDateInfo rfq={quotation.rfq} view="horizontal" />
        <Separator />
        <QuotationTotal quotation={quotation} view="horizontal" />
        <Separator />
        <CardDescription>
          {`${t("updatedAt")}: ${localizedRelativeDate(
            updatedAt,
            new Date(),
            locale
          )}`}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-center md:justify-start">
        <Link
          href={`/quotation/${id}`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          <span>{t("more")}</span>
          <ArrowRight />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default QuotationCard;
