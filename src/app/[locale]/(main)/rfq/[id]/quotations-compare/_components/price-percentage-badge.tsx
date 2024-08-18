import { useFormatter } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PricePercentageBadgeProps = {
  percentage: number;
};

const PricePercentageBadge = ({ percentage }: PricePercentageBadgeProps) => {
  const format = useFormatter();

  if (percentage === 0) return null;

  return (
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
  );
};

export default PricePercentageBadge;
