import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import { differenceInDays, format } from "date-fns";
import { Calendar, Lock, Globe, HelpCircle, Banknote } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

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
  displayRfqLink: boolean;
};

export const RFQDateInfo = ({
  endDate,
  view,
}: {
  endDate: Date;
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
          title={t("endDate")}
          content={
            <div className="flex flex-row space-x-2">
              <span>{format(endDate, "dd.MM.yyyy")}</span>
              {daysLeft > 0 ? (
                <Badge variant="outline">{t("daysLeft", { daysLeft })}</Badge>
              ) : (
                <Badge variant="destructive">{t("completed")}</Badge>
              )}
            </div>
          }
          view={view}
        />
      </div>
    </>
  );
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

  const { company, privateRequest, currency } = rfq;

  return (
    <div className="w-full pr-4 space-y-4">
      <RFQDateInfo endDate={rfq.endDate} view="horizontal" />
      <Separator />
      <MainInfoItem
        icon={<Banknote />}
        title={t("currency")}
        content={currency}
        view="horizontal"
      />
      <Separator />
      <RFQType privateRequest={privateRequest} />
    </div>
  );
};

export default RFQMainInfo;
