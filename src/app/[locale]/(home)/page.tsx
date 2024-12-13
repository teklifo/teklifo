import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Stepper from "./_components/stepper";
import ClientHeroSection from "./_components/client-hero-section";
import ClientFeatures from "./_components/client-features";
import Documentation from "./_components/documentation";
import SupplierHeroSection from "./_components/supplier-hero-section";
import JoinNowComponent from "./_components/join-now-component";
import AIFeature from "./_components/ai-feature";
import SupplierFeatures from "./_components/supplier-features";

type Props = {
  params: { locale: string };
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

const Home = async () => {
  const t = await getTranslations("Home");

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <MaxWidthWrapper>
          <ClientHeroSection />
        </MaxWidthWrapper>
        <Stepper />
        <MaxWidthWrapper>
          <ClientFeatures />
          <AIFeature />
          <Documentation />
        </MaxWidthWrapper>
      </div>
      <div className="border-t">
        <MaxWidthWrapper>
          <SupplierHeroSection />
          <SupplierFeatures />
          <JoinNowComponent />
        </MaxWidthWrapper>
      </div>
    </>
  );
};

export default Home;
