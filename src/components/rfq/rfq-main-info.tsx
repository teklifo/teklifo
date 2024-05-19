import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar,
  Lock,
  Globe,
  HelpCircle,
  Banknote,
  Building2,
  Fingerprint,
} from "lucide-react";
import { Link } from "@/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MainInfoItem from "@/components/main-info-item";
import { Separator } from "@/components/ui/separator";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
    products: {
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

const RFQMainInfo = ({
  rfq: { companyId, company, publicRequest, startDate, endDate, currency },
}: RFQMainInfoProps) => {
  const t = useTranslations("RFQ");

  return (
    <div className="space-y-6 border bg-card shadow-sm h-full rounded-xl p-4 md:p-6">
      <div className="space-y-4">
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
        <MainInfoItem
          icon={<Fingerprint />}
          title={t("tin")}
          content={company.tin}
        />
        <Separator />
      </div>
      <div className="space-y-4">
        <div className="flex flex-col items-center md:flex-row md:space-x-2">
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
        </div>
        <MainInfoItem
          icon={<Calendar />}
          title={t("date")}
          content={`${format(startDate, "dd.MM.yyyy")} - ${format(
            endDate,
            "dd.MM.yyyy"
          )}`}
        />
        <MainInfoItem
          icon={<Banknote />}
          title={t("currency")}
          content={currency}
        />
      </div>
    </div>
  );
};

export default RFQMainInfo;