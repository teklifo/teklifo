"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import request from "@/lib/request";

type AIAnalysisProps = {
  rfqId: string;
};

const AIAnalysis = ({ rfqId }: AIAnalysisProps) => {
  const t = useTranslations("QuotationsAIAnalysis");
  const format = useFormatter();

  const [loading, setLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIQuotationsAnalysisType>();

  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (aiAnalysis && currentIndex < aiAnalysis.message.length) {
      const timeout = setTimeout(() => {
        setCurrentText(
          (prevText) => prevText + aiAnalysis.message[currentIndex]
        );
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 1);

      return () => clearTimeout(timeout);
    }
  }, [aiAnalysis, currentIndex]);

  async function analyzeQuotationsWithAI() {
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

      setAiAnalysis(result);

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
    <>
      <div className="flex p-10 space-y-4 bg-muted rounded-xl flex-col justify-center items-center">
        <Sparkles className="h-24 w-24" />
        <Button
          onClick={analyzeQuotationsWithAI}
          disabled={loading}
          className="space-x-2"
        >
          <Sparkles />
          <span>{t("startAnalysis")}</span>
        </Button>
      </div>
      <div className="mb-8">
        {aiAnalysis && (
          <div className="space-y-4">
            <h4 className="text-xl text-muted-foreground">
              {format.dateTime(new Date(aiAnalysis.createdAt), {
                dateStyle: "long",
                timeStyle: "medium",
              })}
            </h4>
            <ReactMarkdown>{currentText}</ReactMarkdown>
          </div>
        )}
      </div>
    </>
  );
};

export default AIAnalysis;
