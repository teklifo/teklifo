"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { Sparkles } from "lucide-react";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import AIAnalysisMessage from "./ai-analysis-message";
import QuotationSelect from "./quotation-select";
import RFQItemsSelect from "./rfq-items-select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useQuotationsAIAnalysisStore } from "../_store";
import request from "@/lib/request";
import { RequestForQuotationType } from "@/types";

type StepProps = {
  stepNumber: string;
  label: string;
  children: React.ReactNode;
};

const Step = ({ stepNumber, label, children }: StepProps) => {
  return (
    <div className="space-y-1">
      <div className="flex flex-row items-center space-x-2">
        <div className="flex justify-center items-center w-8 h-8 text-lg font-semibold rounded-full border text-foreground">
          {stepNumber}
        </div>
        {children}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
};

type AIAnalysisSettingsProps = {
  rfq: RequestForQuotationType;
};

const AIAnalysisSettings = ({ rfq }: AIAnalysisSettingsProps) => {
  const t = useTranslations("QuotationsAIAnalysis");

  const [loading, setLoading] = useState<boolean>(false);
  const [aiAnalysisList, setAiAnalysisList] =
    useState<AIQuotationsAnalysisType[]>();

  const selectedQuotations = useQuotationsAIAnalysisStore(
    (state) => state.quotations
  );

  const selectedRfqItems = useQuotationsAIAnalysisStore(
    (state) => state.rfqItems
  );

  async function analyzeQuotationsUsingAI() {
    setLoading(true);

    const config = {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: JSON.stringify({
        quotations: selectedQuotations.map((quot) => quot.id),
        rfqItems: selectedRfqItems,
      }),
    };

    try {
      const result = await request<AIQuotationsAnalysisType>(
        `/api/ai/rfq/${rfq.id}/top-quotations`,
        config
      );

      const resultSorted = { ...result, id: new Date().toString() };

      setAiAnalysisList((prevState) => {
        if (!prevState) return [resultSorted];
        const list = [...prevState];
        list.unshift(resultSorted);
        return list;
      });

      toast({
        title: t("analysisCompleted"),
        description: t("analysisCompletedHint"),
      });
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("analysisError"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex p-6 space-y-8 border rounded-xl flex-col justify-start items-start md:p-10">
        <Step stepNumber="1" label={t("quotationsHint")}>
          <QuotationSelect rfqId={rfq.id} />
        </Step>
        <Step stepNumber="2" label={t("rfqItemsHint")}>
          <RFQItemsSelect rfq={rfq} />
        </Step>
        <Step stepNumber="3" label={t("disclaimer")}>
          <Button
            onClick={analyzeQuotationsUsingAI}
            disabled={
              loading ||
              selectedQuotations.length === 0 ||
              selectedRfqItems.length === 0
            }
            className="space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t("startAnalysis")}</span>
          </Button>
        </Step>
      </div>
      <div>
        {
          <div className="space-y-10">
            {aiAnalysisList?.map((aiAnalysis) => (
              <AIAnalysisMessage key={aiAnalysis.id} aiAnalysis={aiAnalysis} />
            ))}
          </div>
        }
      </div>
    </div>
  );
};

export default AIAnalysisSettings;
