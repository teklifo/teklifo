import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Coins,
  LineChart,
  RefreshCcw,
  HandCoins,
  Send,
  FileStack,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/navigation";
import ClientImage from "@/components/client-image";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  params: { locale: string };
};

type FeatureProps = {
  label: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
};

const Feature = ({ label, text, icon: Icon }: FeatureProps) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex justify-center items-center bg-primary rounded-full p-2 w-8 h-8 shrink-0">
        <Icon className="text-background w-5 h-5" />
      </div>
      <div className="">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {label}
        </h3>
        <p className="text-xl text-muted-primary mt-2">{text}</p>
      </div>
    </div>
  );
};

const Home = async () => {
  const t = await getTranslations("Home");

  return (
    <MaxWidthWrapper>
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24">
        <div>
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground mt-4">{t("subtitle")}</p>
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
            <Link
              href={`#features`}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <span>{t("more")}</span>
            </Link>
          </div>
        </div>
        <div className="min-h-[50vh] hidden justify-center items-center py-6 md:flex">
          <ClientImage
            src={`/illustrations/light/hero.svg`}
            alt="Main image"
            priority
            width={800}
            height={800}
          />
        </div>
      </div>
      <div id="features" className="mt-16 md:mt-0">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          {t("featuresTitle")}
        </h2>
        <p className="text-xl text-muted-foreground mt-4 flex">
          {t("featuresSubtitle")}
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 mt-16 mb-24 gap-16">
        <Feature
          label={t("featureLabel1")}
          text={t("featureText1")}
          icon={Coins}
        />
        <Feature
          label={t("featureLabel2")}
          text={t("featureText2")}
          icon={Send}
        />
        <Feature
          label={t("featureLabel3")}
          text={t("featureText3")}
          icon={FileStack}
        />
        <Feature
          label={t("featureLabel4")}
          text={t("featureText4")}
          icon={LineChart}
        />
        <Feature
          label={t("featureLabel5")}
          text={t("featureText5")}
          icon={HandCoins}
        />
        <Feature
          label={t("featureLabel6")}
          text={t("featureText6")}
          icon={RefreshCcw}
        />
      </div>
      <div className="flex flex-col items-center text-center bg-foreground rounded-2xl p-8 md:p-20 mt-20 mx-auto space-y-5">
        <h2 className="text-background scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
          {t("suppliersTitle")}
        </h2>
        <p className="text-xl text-background mt-4">{t("suppliersSubitle")}</p>
        <Link
          href={`/dashboard`}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "bg-background text-foreground hover:bg-background hover:text-foreground space-x-2"
          )}
        >
          <span>{t("startSelling")}</span>
          <ArrowRight />
        </Link>
      </div>
    </MaxWidthWrapper>
  );
};

export default Home;
