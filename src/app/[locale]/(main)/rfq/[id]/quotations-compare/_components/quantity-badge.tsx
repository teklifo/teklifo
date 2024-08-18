import { useFormatter } from "next-intl";
import { CircleMinus, CirclePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type QuantityBadgeProps = {
  quantityDifference: number;
};

const QuantityBadge = ({ quantityDifference }: QuantityBadgeProps) => {
  const format = useFormatter();

  if (quantityDifference === 0) return null;

  return (
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
  );
};

export default QuantityBadge;
