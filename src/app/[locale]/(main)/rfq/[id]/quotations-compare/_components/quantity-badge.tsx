import { useTranslations } from "next-intl";
import { CircleMinus, CirclePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type QuantityBadgeProps = {
  quantityDifference: number;
};

const QuantityBadge = ({ quantityDifference }: QuantityBadgeProps) => {
  const t = useTranslations("QuotationsCompare");

  if (quantityDifference === 0) return null;

  const tooltip =
    quantityDifference > 0
      ? t("quantitySurplus", { quantityDifference })
      : t("quantityDisadvantage", { quantityDifference: -quantityDifference });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className={cn(
              quantityDifference < 0 ? "text-destructive" : "text-green-500",
              "font-semibold"
            )}
          >
            {quantityDifference < 0 ? (
              <CircleMinus className="h-4 w-4" />
            ) : (
              <CirclePlus className="h-4 w-4" />
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

export default QuantityBadge;
