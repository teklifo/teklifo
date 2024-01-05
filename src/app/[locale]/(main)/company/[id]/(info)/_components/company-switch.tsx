"use client";

import { useState } from "react";
import Link from "next/link";
import { Company as CompanyType } from "@prisma/client";
import { ChevronsUpDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type CompanySwitchProps = {
  id: string;
  companies: CompanyType[];
};

const CompanySwitch = ({ id, companies }: CompanySwitchProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2 mb-2"
    >
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-lg font-semibold h-10 px-4 py-2">
          {companies.find((company) => company.id === id)?.name}
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">
        {companies.map((company) =>
          company.id === id ? null : (
            <Link
              key={company.id}
              href={`/company/${company.id}`}
              className={cn(
                "w-full h-10 mx-4 my-2",
                buttonVariants({ variant: "outline" })
              )}
            >
              {company.name}
            </Link>
          )
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CompanySwitch;
