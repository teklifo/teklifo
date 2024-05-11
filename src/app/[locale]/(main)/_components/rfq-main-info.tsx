import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  Calendar,
  Lock,
  Globe,
  HelpCircle,
  CircleDollarSign,
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
    <div className="space-y-6 bg-muted rounded-xl p-6">
      <div className="space-y-2">
        <div className="flex flex-row items-end space-x-2">
          <Building2 />
          <span className="font-semibold">{`${t("company")}:`}</span>
          <Link
            href={`/company/${companyId}`}
            className="scroll-m-20 underline text-lg font-semibold tracking-tight"
          >
            {company?.name}
          </Link>
        </div>
        <div className="flex flex-row items-end space-x-2">
          <Fingerprint />
          <span className="font-semibold">{`${t("tin")}:`}</span>
          <span>{company?.tin}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-row w-auto space-x-2">
          {publicRequest ? (
            <>
              <Globe />
              <span className="font-semibold">{t("public")}</span>
            </>
          ) : (
            <>
              <Lock />
              <span className="font-semibold">{t("private")}</span>
            </>
          )}
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
        <div className="flex flex-row space-x-2">
          <Calendar />
          <span className="font-semibold">{`${t("date")}:`}</span>
          <span>
            {`${format(startDate, "dd.MM.yyyy")} - ${format(
              endDate,
              "dd.MM.yyyy"
            )}`}
          </span>
        </div>
        <div className="flex flex-row space-x-2">
          <CircleDollarSign />
          <span className="font-semibold">{`${t("currency")}:`}</span>
          <span>{currency}</span>
        </div>
      </div>
    </div>
  );
};

export default RFQMainInfo;
