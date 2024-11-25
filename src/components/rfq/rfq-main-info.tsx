import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { Lock, Globe, HelpCircle, Banknote } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RFQDateInfo } from "./rfq-date-info";
import { Separator } from "../ui/separator";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: {
      select: {
        id: true;
        name: true;
      };
    };
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

export const RFQType = ({ privateRequest }: { privateRequest: boolean }) => {
  const t = useTranslations("RFQ");

  return (
    <div className="flex flex-row space-x-2">
      {privateRequest ? <Lock /> : <Globe />}
      <span>{privateRequest ? t("private") : t("public")}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{privateRequest ? t("privateHint") : t("publicHint")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const RFQMainInfo = ({ rfq }: RFQMainInfoProps) => {
  const t = useTranslations("RFQ");

  const { privateRequest, currency } = rfq;

  return (
    <div className="w-full pr-4 space-y-4">
      <RFQDateInfo endDate={rfq.endDate} />
      <Separator />
      <MainInfoItem
        icon={<Banknote />}
        title={t("currency")}
        content={currency}
      />
      <Separator />
      <RFQType privateRequest={privateRequest} />
    </div>
  );
};

export default RFQMainInfo;
