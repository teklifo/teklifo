import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Feature = () => {
  const t = useTranslations("Home");

  return (
    <div className="relative group">
      <div className="absolute transition-all duration-1000 opacity-60 -inset-px bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-500 dark:to-purple-500 rounded-xl blur-3xl group-hover:opacity-80 group-hover:-inset-1 group-hover:duration-200"></div>
      <div className="relative w-full p-20 mt-16 flex flex-col items-center bg-background rounded-2xl shadow-lg md:p-20 md:mb-24 md:mt-0 dark:bg-muted bg-opacity-80">
        <h2 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight">
          {t("documentationTitle")}
        </h2>
        <p className="text-2xl font-semibold text-center text-muted-foreground mt-4">
          {t("documentationSubtitle")}
        </p>
        <div className="mt-6">
          <Link
            href="https://teklifo.github.io/documentation/docs/usage-example/problem-formulation"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "space-x-2"
            )}
          >
            <span className="text-lg font-semibold">
              {t("documentationBtn")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Feature;
