"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Feature = () => {
  const t = useTranslations("Home");

  return (
    <motion.div
      id="docs"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.4 }}
      className="py-32"
    >
      <div className="w-full p-10 flex flex-col items-center backdrop-filter backdrop-blur-lg bg-background/50 rounded-2xl shadow-lg dark:bg-muted/50 bg-opacity-80 md:p-20">
        <h2 className="scroll-m-20 text-center text-4xl font-semibold tracking-tight">
          {t("documentationTitle")}
        </h2>
        <p className="text-2xl font-semibold text-center text-muted-foreground mt-4">
          {t("documentationSubtitle")}
        </p>
        <div className="mt-6">
          <Link
            href="https://teklifo.github.io/documentation/docs/usage-example/problem-formulation"
            target="_blank"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "space-x-2"
            )}
          >
            <span className="text-sm font-semibold md:text-lg">
              {t("documentationBtn")}
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Feature;
