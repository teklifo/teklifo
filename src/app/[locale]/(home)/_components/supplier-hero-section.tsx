import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SupplierHeroSection = () => {
  const t = useTranslations("Home");

  return (
    <div
      id="suppliers-hero-section"
      className="flex flex-col justify-center items-center pt-40 mb-20 text-center"
    >
      <h1 className="scroll-m-20 text-5xl md:text-7xl font-bold tracking-tight">
        {t("suppliersTitle")}
      </h1>
      <p className="text-xl text-muted-foreground mt-8">
        {t("suppliersSubitle")}
      </p>
      <div className="mt-8 space-x-2">
        <Link
          href={`/rfq`}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "space-x-2"
          )}
        >
          <span className="text-lg font-semibold">{t("getStarted")}</span>
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
};

export default SupplierHeroSection;
