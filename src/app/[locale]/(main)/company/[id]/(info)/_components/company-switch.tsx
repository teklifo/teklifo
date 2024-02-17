"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Company as CompanyType } from "@prisma/client";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CompanySwitchProps = {
  id: string;
  companies: CompanyType[];
};

const CompanySwitch = ({ id, companies }: CompanySwitchProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Company");

  return (
    <div className="w-full mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={"w-full justify-between"}
          >
            {companies.find((company) => company.id === id)?.name}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t("search")} />
            <CommandEmpty>{t("noResult")}</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem key={company.id}>
                  <Link href={`/company/${company.id}`} className="w-full">
                    {company.name}
                  </Link>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      company.id === id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CompanySwitch;
