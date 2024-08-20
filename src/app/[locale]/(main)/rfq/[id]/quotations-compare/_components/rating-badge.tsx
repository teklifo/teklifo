import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type RatingBadgeProps = {
  position: number;
};

const RatingBadge = ({ position }: RatingBadgeProps) => {
  const t = useTranslations("QuotationsCompare");

  if (position > 2) return null;

  let tooltip = "";
  if (position === 0) tooltip = t("position1");
  if (position === 1) tooltip = t("position2");
  if (position === 2) tooltip = t("position3");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              "flex justify-center items-center h-6 w-6 rounded-sm",
              position === 0 && "bg-green-500",
              position === 1 && "bg-yellow-500",
              position === 2 && "bg-purple-500"
            )}
          >
            <span className="font-semibold text-background">
              {position + 1}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RatingBadge;
