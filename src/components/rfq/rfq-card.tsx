import { useFormatter, useTranslations } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { Link } from "@/navigation";
import { RFQDateInfo } from "@/components/rfq/rfq-main-info";
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

  const { id, number, title, company, createdAt, _count } = rfq;

  return (
    <Card className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-4 md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted">
      <div className="px-2 col-span-9 space-y-6">
        <Link href={`/rfq/${id}`}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{`${t("rfqNumber")}: ${number}`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            {currentCompany?.id === rfq.company.id ? (
              <Badge variant="outline">
                {`${t("quotationsRecieved", {
                  count: _count.quotations,
                })}`}
              </Badge>
            ) : _count.quotations ? (
              <Badge>{t("quotationsIsSent")}</Badge>
            ) : null}
            <RFQDateInfo endDate={rfq.endDate} />
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

export default RFQCard;
