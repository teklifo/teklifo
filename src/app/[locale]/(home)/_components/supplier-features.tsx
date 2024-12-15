"use client";

import { useTranslations } from "next-intl";
import { Network, ShoppingBag, Scale } from "lucide-react";
import { motion } from "framer-motion";
import Feature from "./feature";

const SupplierFeatures = () => {
  const t = useTranslations("Home");

  return (
    <div className="py-20">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0 }}
      >
        <h2 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight">
          {t("supplierFeaturesTitle")}
        </h2>
        <p className="text-2xl font-semibold text-center text-muted-foreground mt-4">
          {t("supplierFeaturesSubtitle")}
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
            label={t("supplierFeatureLabel1")}
            text={t("supplierFeatureText1")}
            icon={Network}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Feature
            label={t("supplierFeatureLabel2")}
            text={t("supplierFeatureText2")}
            icon={ShoppingBag}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Feature
            label={t("supplierFeatureLabel3")}
            text={t("supplierFeatureText3")}
            icon={Scale}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SupplierFeatures;
