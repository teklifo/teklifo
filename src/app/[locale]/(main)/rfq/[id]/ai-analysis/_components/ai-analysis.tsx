"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { Sparkles } from "lucide-react";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import AIAnalysisMessage from "./ai-analysis-message";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import request from "@/lib/request";

type AIAnalysisProps = {
  rfqId: string;
};

const AIAnalysis = ({ rfqId }: AIAnalysisProps) => {
  const t = useTranslations("QuotationsAIAnalysis");

  const [loading, setLoading] = useState<boolean>(false);
  const [aiAnalysisList, setAiAnalysisList] =
    useState<AIQuotationsAnalysisType[]>();

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
        `/api/ai/rfq/${rfqId}/top-quotations`,
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
      <div className="flex p-10 space-y-4 bg-muted rounded-xl flex-col justify-center items-center">
        <Sparkles className="h-24 w-24" />
        <Button
          onClick={analyzeQuotationsUsingAI}
          disabled={loading}
          className="space-x-2"
        >
          <Sparkles />
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

export default AIAnalysis;
