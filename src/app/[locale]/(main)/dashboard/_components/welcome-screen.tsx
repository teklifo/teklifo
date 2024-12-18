import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import ThemedImage from "@/components/themed-image";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WelcomeScreen = async () => {
  const t = await getTranslations("WelcomeScreen");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="flex flex-col items-center justify-start h-[80vh] space-y-12">
        <div className="w-full flex justify-center items-center text-center">
          <div className="max-w-lg space-y-8">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-lg">{t("hintText")}</p>
            <div className="flex flex-col space-y-2">
              <Link
                href={`/new-company`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "space-x-2"
                )}
              >
                <Plus className="text-muted-foreground h-4 w-4" />
                <span>{t("createCompany")}</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-center lg:flex-col lg:space-y-12">
          <ThemedImage
            src="/illustrations/light/invitation.svg"
            alt="Company suggestion"
            priority
            width={200}
            height={200}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default WelcomeScreen;
