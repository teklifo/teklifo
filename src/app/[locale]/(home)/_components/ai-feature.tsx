"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import ThemedImage from "@/components/themed-image";

const AIFeature = () => {
  const t = useTranslations("Home");

  return (
    <div
      id="ai-feature"
      className="pt-32 flex flex-col justify-center items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <h2 className="scroll-m-20 text-5xl font-bold tracking-tight">
          <span className="block">{t("aiTitleOne")}</span>
          <span className="block">{t("aiTitleTwo")}</span>
        </h2>
        <p className="text-2xl font-semibold text-muted-foreground mt-8">
          {t("aiSubtitle")}
        </p>
      </motion.div>
      <div className="relative group justify-center items-center py-12">
        <div className="absolute transition-all duration-1000 opacity-60 inset-y-10 -inset-x-4 dark:-inset-px bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-500 dark:to-purple-500 rounded-xl blur-2xl dark:blur-3xl group-hover:opacity-80 group-hover:dark:-inset-1 group-hover:duration-200"></div>
        <div className="relative">
          <ThemedImage
            src={`/hero/light/ai.gif`}
            alt="AI analysis"
            priority
            width={800}
            height={800}
            className="rounded-2xl border-8 border-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default AIFeature;
