import { useEffect, useState } from "react";
import { useFormatter } from "next-intl";
import ReactMarkdown from "react-markdown";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

type AIAnalysisMessageProps = {
  aiAnalysis: AIQuotationsAnalysisType;
};

const AIAnalysisMessage = ({ aiAnalysis }: AIAnalysisMessageProps) => {
  const format = useFormatter();

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
        {format.dateTime(new Date(aiAnalysis.createdAt), {
          dateStyle: "long",
          timeStyle: "medium",
        })}
      </h4>
      <ReactMarkdown>{currentText}</ReactMarkdown>
      <Separator />
    </div>
  );
};

export default AIAnalysisMessage;
