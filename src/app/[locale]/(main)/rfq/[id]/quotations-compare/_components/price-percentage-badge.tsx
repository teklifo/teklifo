import { useFormatter, useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type PricePercentageBadgeProps = {
  percentage: number;
};

const PricePercentageBadge = ({ percentage }: PricePercentageBadgeProps) => {
  const t = useTranslations("QuotationsCompare");

  const format = useFormatter();

  if (percentage === 0) return null;

  const tooltip =
    percentage > 0
      ? t("priceHigherThanRequested", { percentage: percentage.toFixed(0) })
      : t("priceLowerThanRequested", { percentage: -percentage.toFixed(0) });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={cn(
              percentage < 0 ? "text-destructive" : "text-green-500",
              "font-semibold space-x-1"
            )}
          >
            <span>
              {`${format.number(percentage, {
                style: "decimal",
                maximumFractionDigits: 0,
              })}%`}
            </span>
            {percentage < 0 ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
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

export default PricePercentageBadge;
