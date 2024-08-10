import { Coins, Send, LineChart } from "lucide-react";
import { useTranslations } from "next-intl";

type StepProps = {
  label: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
};

const Step = ({ label, text, icon: Icon }: StepProps) => {
  return (
    <div className="rounded-lg p-6 bg-card border flex gap-4 items-start md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted md:hover:text-card-foreground">
      <div className="flex justify-center items-center bg-primary rounded-full p-2 w-16 h-16 shrink-0">
        <Icon className="text-background w-8 h-8" />
      </div>
      <div className="">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {label}
        </h3>
        <p className="text-xl text-muted-primary mt-2">{text}</p>
      </div>
    </div>
  );
};

const Stepper = () => {
  const t = useTranslations("Home");

  return (
    <div className="mt-16 mb-24 md:mt-0">
      <h2 className="scroll-m-20 text-center text-3xl font-semibold tracking-tight mb-8">
        {t("howItWorks")}
      </h2>
      <div className="space-y-3">
        <Step icon={Coins} label={t("stepLabel1")} text={t("stepText1")} />
        <Step icon={Send} label={t("stepLabel2")} text={t("stepText2")} />
        <Step icon={LineChart} label={t("stepLabel3")} text={t("stepText3")} />
      </div>
    </div>
  );
};

export default Stepper;
