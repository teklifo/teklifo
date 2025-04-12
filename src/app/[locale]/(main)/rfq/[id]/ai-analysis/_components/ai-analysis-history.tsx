import { AIQuotationsAnalysis as AIQuotationsAnalysisType } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import { Separator } from "@/components/ui/separator";
import ClientDate from "@/components/client-date";

type AIAnalysisHistoryProps = {
  analysisHistory: AIQuotationsAnalysisType[];
};

const AIAnalysisHistory = ({ analysisHistory }: AIAnalysisHistoryProps) => {
  return (
    <div className="space-y-10">
      {analysisHistory.map((analysis) => (
        <div key={analysis.id} className="space-y-4">
          <h4 className="text-xl text-muted-foreground">
            <ClientDate date={analysis.createdAt} format="dd MMMM yyyy HH:mm" />
          </h4>
          <ReactMarkdown>{analysis.message}</ReactMarkdown>
          <Separator />
        </div>
      ))}
    </div>
  );
};

export default AIAnalysisHistory;
