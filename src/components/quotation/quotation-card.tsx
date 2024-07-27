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

  return (
    <Card
      className={cn(
        "md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted",
        !rfq.latestVersion && "text-muted-foreground"
      )}
    >
      <div className="px-2 space-y-6">
        <Link href={`/quotation/${id}`}>
          <CardHeader>
            <QuotationOutdated
              rfq={rfq}
              currentCompanyId={currentCompany?.id}
              className="mb-2"
            />
            <div className="flex flex-row justify-start items-center space-x-4">
              <Avatar className="md:h-20 md:w-20">
                <AvatarFallback>
                  {getAvatarFallback(company.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{company.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
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
    </Card>
  );
};

export default QuotationCard;
