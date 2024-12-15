import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { buttonVariants } from "@/components/ui/button";
import ThemedImage from "@/components/themed-image";
import { cn } from "@/lib/utils";

const JoinNowComponent = () => {
  const t = useTranslations("Home");

  return (
    <div id="price" className="relative">
      <div className="absolute transition-all duration-1000 opacity-60 inset-y-10 -inset-x-4 dark:-inset-px bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-500 dark:to-purple-500 rounded-xl blur-2xl dark:blur-3xl group-hover:opacity-80 group-hover:dark:-inset-1 group-hover:duration-200"></div>
      <div className="flex flex-col justify-center items-center text-center h-[50vh] mt-16 mx-auto backdrop-filter px-2 rounded-3xl bg-background/80 backdrop-blur-lg bg-clip-padding p-8 space-y-5">
        <h2 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
          {t("joinNowTitle")}
        </h2>
        <p className="max-w-3xl text-xl mt-4">{t("joinNowSubtitle")}</p>
        <Link
          href={`/dashboard`}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "space-x-2"
          )}
        >
          <span className="text-lg font-semibold">{t("join")}</span>
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default JoinNowComponent;
