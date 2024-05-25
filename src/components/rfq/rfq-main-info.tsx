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
import { Link } from "@/navigation";
import MainInfoItem from "@/components/main-info-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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

const RFQMainInfo = ({ rfq }: RFQMainInfoProps) => {
  const t = useTranslations("RFQ");

  const { companyId, company, publicRequest, startDate, endDate, currency } =
    rfq;

  const daysLeft = differenceInDays(endDate, new Date());

  return (
    <div className="w-full space-y-4 border bg-card shadow-sm rounded-xl p-4 mb-4 lg:p-6">
      <MainInfoItem
        icon={<Building2 />}
        title={t("company")}
        content={
          <Link
            href={`/company/${companyId}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {company.name}
          </Link>
        }
      />
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
      <div>
        <MainInfoItem
          icon={<Calendar />}
          title={t("date")}
          content={`${format(startDate, "dd.MM.yyyy")} - ${format(
            endDate,
            "dd.MM.yyyy"
          )}`}
        />
        {daysLeft > 0 ? (
          <Badge>{t("daysLeft", { daysLeft })}</Badge>
        ) : (
          <Badge variant="destructive">{t("outdated")}</Badge>
        )}
      </div>
      <MainInfoItem
        icon={<Banknote />}
        title={t("currency")}
        content={currency}
      />
    </div>
  );
};

export default RFQMainInfo;
