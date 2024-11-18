import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import ThemedImage from "@/components/themed-image";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BetaDisclaimer = async () => {
  const t = await getTranslations("Dashboard");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="flex flex-col items-center justify-start h-[80vh] space-y-12">
        <div className="w-full flex justify-center items-center text-center">
          <div className="max-w-lg space-y-8">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-foreground">
              {t("welcome")}
            </h1>
            <p className="text-lg">{t("betaDisclaimer")}</p>
            <div className="flex flex-col space-y-2">
              <a
                href={`mailto: ${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex items-center w-full space-x-2"
                )}
              >
                <Mail className="w-4 -h-4" />
                <span>{t("contact")}</span>
              </a>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-center lg:flex-col lg:space-y-12">
          <ThemedImage
            src="/illustrations/light/contact.svg"
            alt="Contact"
            priority
            width={200}
            height={200}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default BetaDisclaimer;
