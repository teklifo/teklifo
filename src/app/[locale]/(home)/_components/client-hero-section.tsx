import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import ThemedImage from "@/components/themed-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ClientHeroSection = () => {
  const t = useTranslations("Home");

  return (
    <div className="flex flex-col justify-center items-center h-[70vh] text-center pb-20">
      <h1 className="scroll-m-20 text-5xl md:text-7xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <div className="mt-16 space-x-2">
        <Link
          href="/rfq"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "space-x-2"
          )}
        >
          <span className="text-lg font-semibold">{t("getStarted")}</span>
          <ArrowRight />
        </Link>
        <Link
          href={`#suppliers-hero-section`}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          <span className="text-lg font-semibold">{t("supplier")}</span>
        </Link>
      </div>
    </div>
  );
};

export default ClientHeroSection;
