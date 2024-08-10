import { Link } from "@/navigation";
import type { Company as CompanyType } from "@prisma/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getAvatarFallback } from "@/lib/utils";
import { ClassValue } from "clsx";

type CompanyAvatarProps = {
  company: CompanyType;
  className?: ClassValue;
};

const CompanyAvatar = ({ company, className }: CompanyAvatarProps) => {
  return (
    <Link href={`/company/${company.id}`} className={cn(className)}>
      <Avatar className="md:h-20 md:w-20">
        <AvatarFallback>{getAvatarFallback(company.name)}</AvatarFallback>
      </Avatar>
      <h5 className="text-xl text-center text-muted-foreground break-all">
        {company.name}
      </h5>
    </Link>
  );
};

export default CompanyAvatar;