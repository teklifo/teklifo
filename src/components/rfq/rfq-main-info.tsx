import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import {
  Calendar,
  Lock,
  Globe,
  HelpCircle,
  Banknote,
  Building2,
} from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import CompanyInfo from "../company/company-info";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
    items: {
      include: {
        product: true;
      };
    };
    participants: true;
  };
}>;

type RFQMainInfoProps = {
  rfq: RequestForQuotationType;
};

export const RFQDateInfo = ({
  rfq: { startDate, endDate },
  view,
}: {
  rfq: { startDate: Date; endDate: Date };
  view: "horizontal" | "vertical";
}) => {
  const t = useTranslations("RFQ");

  const daysLeft = differenceInDays(endDate, new Date());

  return (
    <>
      <div
        className={cn(
          view === "horizontal" ? "md:flex md:flex-row md:space-x-2" : ""
        )}
      >
        <MainInfoItem
          icon={<Calendar />}
          title={t("date")}
          content={`${format(startDate, "dd.MM.yyyy")} - ${format(
            endDate,
            "dd.MM.yyyy"
          )}`}
          view={view}
        />
        {daysLeft > 0 ? (
          <Badge>{t("daysLeft", { daysLeft })}</Badge>
        ) : (
          <Badge variant="destructive">{t("outdated")}</Badge>
        )}
      </div>
    </>
  );
};

export const QuotationCurrency = ({
  currency,
  view,
}: {
  currency: string;
  view: "horizontal" | "vertical";
}) => {
  const t = useTranslations("RFQ");

  return (
    <MainInfoItem
      icon={<Banknote />}
      title={t("currency")}
      content={currency}
      view={view}
    />
  );
};

const RFQMainInfo = ({ rfq }: RFQMainInfoProps) => {
  const t = useTranslations("RFQ");

  const { company, publicRequest, currency } = rfq;

  return (
    <div className="w-full space-y-4 border bg-card shadow-sm rounded-xl p-4 lg:p-6">
      <CompanyInfo
        icon={<Building2 />}
        company={company}
        title={t("company")}
        view="vertical"
      />
      <Separator />
      <div className="flex flex-row space-x-2">
        {publicRequest ? <Globe /> : <Lock />}
        <span>{publicRequest ? t("public") : t("private")}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{publicRequest ? t("publicHint") : t("privateHint")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Separator />
      <RFQDateInfo rfq={rfq} view="vertical" />
      <Separator />
      <MainInfoItem
        icon={<Banknote />}
        title={t("currency")}
        content={currency}
        view="vertical"
      />
    </div>
  );
};

export default RFQMainInfo;
