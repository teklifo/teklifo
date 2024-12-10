import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const JoinNowComponent = () => {
  const t = useTranslations("Home");

  return (
    <div className="flex flex-col items-center text-center bg-primary rounded-2xl p-8 md:p-20 mx-auto space-y-5 mt-16 md:mb-24 md:mt-0 dark:bg-foreground">
      <h2 className="text-background scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
        {t("joinNowTitle")}
      </h2>
      <p className="text-xl text-background mt-4">{t("joinNowSubtitle")}</p>
      <div className="text-4xl">💰</div>
      <Link
        href={`/dashboard`}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "bg-background text-primary hover:bg-background hover:text-primary space-x-2"
        )}
      >
        <span className="text-lg font-semibold">{t("join")}</span>
        <ArrowRight />
      </Link>
    </div>
  );
};

export default JoinNowComponent;
