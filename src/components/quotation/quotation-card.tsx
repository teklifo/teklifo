import { useLocale, useTranslations } from "next-intl";
import type { Prisma, Company as CompanyType } from "@prisma/client";
import { Link } from "@/navigation";
import { QuotationOutdated, QuotationTotal } from "./quotation-main-info";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, getAvatarFallback, localizedRelativeDate } from "@/lib/utils";
import { RFQDateInfo } from "../rfq/rfq-main-info";
import { Avatar, AvatarFallback } from "../ui/avatar";

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

  const displayCompany =
    currentCompany?.id === rfq.company.id ? company : rfq.company;

  return (
    <Card
      className={cn(
        "grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-4",
        !rfq.latestVersion && "text-muted-foreground"
      )}
    >
      <div className="px-2 col-span-9 space-y-6">
        <Link href={`/quotation/${id}`}>
          <CardHeader>
            <QuotationOutdated
              rfq={rfq}
              currentCompanyId={currentCompany?.id}
              className="mb-2"
            />
            <CardTitle>{rfq.title}</CardTitle>
            <CardDescription>{`${t("quotation")} #${id}`}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[150px] space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <RFQDateInfo endDate={rfq.endDate} view="horizontal" />
            <QuotationTotal quotation={quotation} view="horizontal" />
            <CardDescription>
              {`${t("updatedAt")}: ${localizedRelativeDate(
                new Date(updatedAt),
                new Date(),
                locale
              )}`}
            </CardDescription>
          </CardContent>
        </Link>
      </div>
      <div className="p-2 col-span-3 space-y-6">
        <Link
          href={`/company/${displayCompany.id}`}
          className="h-full flex flex-col justify-center items-center space-y-2"
        >
          <Avatar className="md:h-20 md:w-20">
            <AvatarFallback>
              {getAvatarFallback(displayCompany.name)}
            </AvatarFallback>
          </Avatar>
          <h5 className="text-center scroll-m-20 text-sm tracking-tight break-all">
            {displayCompany.name}
          </h5>
        </Link>
      </div>
    </Card>
  );
};

export default QuotationCard;
