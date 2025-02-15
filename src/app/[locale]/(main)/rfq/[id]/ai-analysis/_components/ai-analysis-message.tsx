import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import { Separator } from "@/components/ui/separator";
import ClientDate from "@/components/client-date";

type AIAnalysisMessageProps = {
  aiAnalysis: AIQuotationsAnalysisType;
};

const AIAnalysisMessage = ({ aiAnalysis }: AIAnalysisMessageProps) => {
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

  return (
    <div className="space-y-4">
      <h4 className="text-xl text-muted-foreground">
        <ClientDate date={aiAnalysis.createdAt} format="dd MMMM yyyy HH:mm" />
      </h4>
      <ReactMarkdown>{currentText}</ReactMarkdown>
      <Separator />
    </div>
  );
};

export default AIAnalysisMessage;
