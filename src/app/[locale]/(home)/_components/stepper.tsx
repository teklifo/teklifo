import { useTranslations } from "next-intl";
import { Timeline } from "./timeline";
import ThemedImage from "@/components/themed-image";

const Stepper = () => {
  const t = useTranslations("Home");

  const timelineData = [
    {
      title: t("stepLabel1"),
      content: (
        <div>
          <p className="text-2xl font-semibold text-muted-foreground">
            {t("stepText1")}
          </p>
          <div className="hidden md:flex">
            <ThemedImage
              src="/hero/light/rfq.png"
              alt="RFQ"
              width={1000}
              height={1000}
            />
          </div>
        </div>
      ),
    },
    {
      title: t("stepLabel2"),
      content: (
        <div>
          <p className="text-2xl font-semibold text-muted-foreground">
            {t("stepText2")}
          </p>
          <div className="hidden md:flex">
            <ThemedImage
              src="/hero/light/quot.png"
              alt="Quotation"
              width={1000}
              height={1000}
            />
          </div>
        </div>
      ),
    },
    {
      title: t("stepLabel3"),
      content: (
        <div>
          <p className="text-2xl font-semibold text-muted-foreground">
            {t("stepText3")}
          </p>
          <div className="hidden md:flex">
            <ThemedImage
              src="/hero/light/analysis.png"
              alt="Quotation"
              width={1000}
              height={1000}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div id="how-it-works" className="pt-16">
      <Timeline data={timelineData} />
    </div>
  );
};

export default Stepper;
