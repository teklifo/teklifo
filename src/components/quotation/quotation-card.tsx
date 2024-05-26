import { useTranslations } from "next-intl";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import {
  QuotationAttributes,
  QuotationBase,
  CompanyInfo,
  QuotationTotal,
} from "./quotation-main-info";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    company: true;
    rfq: {
      include: {
        company: true;
      };
    };
    items: {
      include: {
        product: true;
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

  const { id, company, rfq } = quotation;

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-center md:text-start">{`${t(
          "quotation"
        )} #${id}`}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[150px] space-y-6 p-4 pt-0 md:p-6 md:pt-0">
        <div className="space-y-4 md:space-y-2">
          <QuotationBase rfq={rfq} />
          <Separator />
        </div>
        <div className="space-y-4 md:space-y-2">
          {currentCompany?.id === rfq.company.id ? (
            <CompanyInfo company={company} title={""} />
          ) : (
            <CompanyInfo company={rfq.company} title={""} />
          )}
          <Separator />
        </div>
        <div className="space-y-4 md:space-y-2">
          <QuotationAttributes quotation={quotation} />
          <Separator />
        </div>
        <QuotationTotal quotation={quotation} />
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
