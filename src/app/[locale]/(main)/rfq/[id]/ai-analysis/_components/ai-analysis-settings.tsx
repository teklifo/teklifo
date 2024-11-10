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
      <div className="flex p-10 space-y-4 border rounded-xl flex-col justify-start items-start">
        <QuotationSelect rfqId={rfq.id} />
        <RFQItemsSelect rfq={rfq} />
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
        <p className="text-sm text-muted-foreground">{t("disclaimer")}</p>
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
