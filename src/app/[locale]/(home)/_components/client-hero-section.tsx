import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import ThemedImage from "@/components/themed-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ClientHeroSection = () => {
  const t = useTranslations("Home");

  return (
    <div className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24">
      <div className="text-center md:text-left">
        <h1 className="scroll-m-20 text-5xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground mt-4">{t("subtitle")}</p>
        <div className="space-x-2 mt-6">
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
      <div className="min-h-[50vh] hidden justify-center items-center py-6 md:flex">
        <ThemedImage
          src={`/illustrations/light/hero.svg`}
          alt="Main image"
          priority
          width={500}
          height={500}
        />
      </div>
    </div>
  );
};

export default ClientHeroSection;
