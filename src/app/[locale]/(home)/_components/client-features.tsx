"use client";

import { useTranslations } from "next-intl";
import { LineChart, HandCoins, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import Feature from "./feature";

const ClientFeatures = () => {
  const t = useTranslations("Home");

  return (
    <div id="client-features" className="pt-16">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0 }}
      >
        <h2 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight">
          {t("featuresTitle")}
        </h2>
        <p className="text-2xl font-semibold text-center text-muted-foreground mt-4">
          {t("featuresSubtitle")}
        </p>
      </motion.div>
      <div className="grid gap-8 mt-16 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Feature
            label={t("featureLabel1")}
            text={t("featureText1")}
            icon={LineChart}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Feature
            label={t("featureLabel2")}
            text={t("featureText2")}
            icon={HandCoins}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Feature
            label={t("featureLabel3")}
            text={t("featureText3")}
            icon={Trophy}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ClientFeatures;
