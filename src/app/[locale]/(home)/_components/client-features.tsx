import { useTranslations } from "next-intl";
import { LineChart, RefreshCcw, HandCoins } from "lucide-react";
import Feature from "./feature";

const ClientFeatures = () => {
  const t = useTranslations("Home");

  return (
    <div className="mt-16 md:mb-48 md:mt-0">
      <h2 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight">
        {t("featuresTitle")}
      </h2>
      <p className="text-2xl font-semibold text-center text-muted-foreground mt-4">
        {t("featuresSubtitle")}
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 mt-16 gap-8 md:mb-24">
        <Feature
          label={t("featureLabel1")}
          text={t("featureText1")}
          icon={LineChart}
        />
        <Feature
          label={t("featureLabel2")}
          text={t("featureText2")}
          icon={HandCoins}
        />
        <Feature
          label={t("featureLabel3")}
          text={t("featureText3")}
          icon={RefreshCcw}
        />
      </div>
    </div>
  );
};

export default ClientFeatures;
