import { useFormatter, useTranslations } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { Link } from "@/navigation";
import { RFQDateInfo } from "@/components/rfq/rfq-date-info";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CompanyAvatar from "../company/company-avatar";
import { RFQWithQuotationsType } from "@/types";

type RFQCardProps = {
  rfq: RFQWithQuotationsType;
  currentCompany?: CompanyType;
};

const RFQCard = ({ rfq, currentCompany }: RFQCardProps) => {
  const t = useTranslations("RFQ");
  const format = useFormatter();

  const { id, number, endDate, title, company, createdAt } = rfq;

  const completed = new Date(endDate) < new Date();

  return (
    <Card className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-4 md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted">
      <div className="px-2 col-span-9 space-y-6">
        <Link href={`/rfq/${id}`}>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{`${t(
                "rfqNumber"
              )}: ${number}`}</CardDescription>
              <RFQBadges rfq={rfq} currentCompany={currentCompany} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <RFQDateInfo endDate={endDate} />
            <CardDescription>
              {`${t("updatedAt")}: ${format.relativeTime(new Date(createdAt))}`}
            </CardDescription>
          </CardContent>
        </Link>
      </div>
      <div className="p-4 col-span-3 space-y-6">
        <CompanyAvatar
          company={company}
          className="h-full flex flex-col justify-center items-center space-y-2"
        />
      </div>
    </Card>
  );
};

type RFQBadgesProps = {
  rfq: RFQWithQuotationsType;
  currentCompany?: CompanyType;
};

const RFQBadges = ({ rfq, currentCompany }: RFQBadgesProps) => {
  const t = useTranslations("RFQ");

  const { company, _count } = rfq;

  return currentCompany?.id === company.id ? (
    <Badge className="bg-green-600 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-400">
      {`${t("quotationsRecieved", {
        count: _count.quotations,
      })}`}
    </Badge>
  ) : _count.quotations ? (
    <Badge className="bg-green-600 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-400">
      {t("quotationsIsSent")}
    </Badge>
  ) : null;
};

export default RFQCard;
