import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/navigation";
import ThemedImage from "@/components/themed-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const IntegrationFeature = () => {
  const t = useTranslations("Home");

  return (
    <div className="grid lg:grid-cols-2 place-items-center pt-32">
      <div className="text-center md:text-left">
        <h1 className="scroll-m-20 text-5xl font-bold tracking-tight">
          {t("integrationTitle")}
        </h1>
        <p className="text-2xl font-semibold text-muted-foreground mt-8">
          {t("integrationSubtitle")}
        </p>
        <div className="space-x-2 mt-8">
          <Link
            href={"https://github.com/teklifo/teklifo-1c"}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "space-x-2"
            )}
          >
            <span className="text-lg font-semibold">
              {t("integrationMore")}
            </span>
            <ArrowRight />
          </Link>
        </div>
      </div>
      <div className="min-h-[50vh] hidden justify-center items-center py-6 lg:flex">
        <ThemedImage
          src="/hero/light/extension.svg"
          alt="Integration"
          priority
          width={500}
          height={500}
        />
      </div>
    </div>
  );
};

export default IntegrationFeature;
