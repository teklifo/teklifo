import { Card } from "@/components/ui/card";

type FeatureProps = {
  label: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
};

const Feature = ({ label, text, icon: Icon }: FeatureProps) => {
  return (
    <Card className="flex gap-4 items-start md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted p-6">
      <div className="flex justify-center items-center bg-primary rounded-full p-2 w-8 h-8 shrink-0">
        <Icon className="text-background w-5 h-5" />
      </div>
      <div className="">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {label}
        </h3>
        <p className="text-xl text-muted-primary mt-2">{text}</p>
      </div>
    </Card>
  );
};

export default Feature;