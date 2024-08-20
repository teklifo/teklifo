import { useTranslations } from "next-intl";
import {
  AlarmClockMinus,
  AlarmClockPlus,
  CircleMinus,
  CirclePlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DeliveryDateBadgeProps = {
  daysDifference: number;
};

const DeliveryDateBadge = ({ daysDifference }: DeliveryDateBadgeProps) => {
  const t = useTranslations("QuotationsCompare");

  if (daysDifference === 0) return null;

  const tooltip =
    daysDifference > 0
      ? t("deliveredLater", { daysDifference })
      : t("deliveredEarlier", { daysDifference: -daysDifference });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={cn(
              daysDifference > 0 ? "text-destructive" : "text-green-500",
              "font-semibold"
            )}
          >
            {daysDifference > 0 ? (
              <AlarmClockMinus className="h-4 w-4" />
            ) : (
              <AlarmClockPlus className="h-4 w-4" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DeliveryDateBadge;
