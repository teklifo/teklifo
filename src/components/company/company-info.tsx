import type { Company as CompanyType } from "@prisma/client";
import { ArrowLeftCircle } from "lucide-react";
import MainInfoItem from "@/components/main-info-item";
import CompanyHoverCard from "@/components/company/company-hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getAvatarFallback } from "@/lib/utils";

type CompanyInfoProps = {
  company: CompanyType;
  icon: React.ReactNode;
  title: string;
  view: "horizontal" | "vertical";
};

const CompanyInfo = ({ company, icon, title, view }: CompanyInfoProps) => {
  return (
    <div
      className={cn(
        "flex flex-row items-center space-x-4",
        view === "horizontal" && "md:justify-start"
      )}
    >
      <MainInfoItem
        icon={icon}
        title={title}
        content={<CompanyHoverCard company={company} />}
        view={view}
      />
      <Avatar>
        <AvatarFallback>{getAvatarFallback(company.name)}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default CompanyInfo;
