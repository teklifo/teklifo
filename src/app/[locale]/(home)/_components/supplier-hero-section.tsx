import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import ClientImage from "@/components/client-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SupplierHeroSection = () => {
  const t = useTranslations("Home");

  return (
    <div
      id="suppliers-hero-section"
      className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24"
    >
      <div className="min-h-[50vh] hidden justify-center items-center py-6 md:flex">
        <ClientImage
          src={`/illustrations/light/hero-suppliers.svg`}
          alt="Main image"
          priority
          width={500}
          height={500}
        />
      </div>
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
          {t("suppliersTitle")}
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          {t("suppliersSubitle")}
        </p>
        <div className="space-x-2 mt-6">
          <Link
            href={`/dashboard`}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "space-x-2"
            )}
          >
            <span>{t("getStarted")}</span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierHeroSection;
