import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Plus, Search } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WelcomeScreen = async () => {
  const t = await getTranslations("WelcomeScreen");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-12">
        <div className="w-full flex justify-center items-center text-center">
          <div className="max-w-lg space-y-8">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-lg">{t("hintText")}</p>
            <div className="flex flex-col space-y-2">
              <Link
                href={`/company`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "space-x-2"
                )}
              >
                <Search className="text-muted-foreground" />
                <span>{t("joinCompany")}</span>
              </Link>
              <Link
                href={`/new-company`}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "space-x-2"
                )}
              >
                <Plus className="text-muted-foreground" />
                <span>{t("createCompany")}</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full h-auto flex items-center justify-center lg:h-full lg:flex-col lg:space-y-12">
          <Image
            src="/illustrations/invitation.svg"
            alt="Company suggestion"
            priority
            width={600}
            height={600}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default WelcomeScreen;
