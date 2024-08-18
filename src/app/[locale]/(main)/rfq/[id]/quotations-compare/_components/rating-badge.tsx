import { cn } from "@/lib/utils";

type RatingBadgeProps = {
  position: number;
};

const RatingBadge = ({ position }: RatingBadgeProps) => {
  if (position > 2) return null;

  return (
    <div
      className={cn(
        "flex justify-center items-center h-6 w-6 rounded-sm",
        position === 0 && "bg-green-500",
        position === 1 && "bg-yellow-500",
        position === 2 && "bg-purple-500"
      )}
    >
      <span className="font-semibold text-background">{position + 1}</span>
    </div>
  );
};

export default RatingBadge;
