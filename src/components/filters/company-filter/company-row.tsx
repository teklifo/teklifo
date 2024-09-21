"use client";

import { Company as CompanyType } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/lib/utils";
import { CheckedState } from "@radix-ui/react-checkbox";

type CompanyRowProps = {
  company: CompanyType;
  checked: boolean;
  onCheckedChange: (value: CheckedState) => void;
};

const CompanyRow = ({ company, checked, onCheckedChange }: CompanyRowProps) => {
  return (
    <div className="flex items-center space-x-6">
      <Checkbox
        id={company.id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-5 w-5"
      />
      <label
        htmlFor={company.id}
        className="flex items-center space-x-6 text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        <Avatar className="md:h-10 md:w-10">
          <AvatarFallback>{getAvatarFallback(company.name)}</AvatarFallback>
        </Avatar>
        <span>{company.name}</span>
      </label>
    </div>
  );
};

export default CompanyRow;
