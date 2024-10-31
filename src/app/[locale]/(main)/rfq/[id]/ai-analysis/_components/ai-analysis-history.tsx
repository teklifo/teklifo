import { useFormatter } from "next-intl";
import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import ReactMarkdown from "react-markdown";

type AIAnalysisHistoryProps = {
  analysisHistory: AIQuotationsAnalysisType[];
};

const AIAnalysisHistory = ({ analysisHistory }: AIAnalysisHistoryProps) => {
  const format = useFormatter();

  return (
    <div className="space-y-8">
      {analysisHistory.map((analysis) => (
        <div key={analysis.id} className="space-y-4">
          <h4 className="text-xl text-muted-foreground">
            {format.dateTime(new Date(analysis.createdAt), {
              dateStyle: "long",
              timeStyle: "medium",
            })}
          </h4>
          <ReactMarkdown>{analysis.message}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
};

export default AIAnalysisHistory;
