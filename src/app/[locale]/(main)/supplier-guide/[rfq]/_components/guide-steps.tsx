import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type GuideStepProps = {
  stepIsDone: boolean;
  stepNumber: number;
  children: React.ReactNode;
};

function GuideStep({ stepIsDone, stepNumber, children }: GuideStepProps) {
  return (
    <div className="flex justify-center items-center text-left space-x-4">
      <div className="flex justify-center items-center w-[50px] h-[50px] text-3xl font-bold rounded-full bg-foreground text-background">
        {stepIsDone ? <Check /> : stepNumber}
      </div>
      <div
        className={cn(
          "text-xl flex-1 text-muted-foreground",
          stepIsDone ? "text-muted" : "text-muted-foreground"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default GuideStep;
