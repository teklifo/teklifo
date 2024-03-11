"use client";

import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { Company as CompanyType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type CompanySwitcherProps = {
  isCollapsed: boolean;
  defaultCompany: CompanyType;
  userCompanies: CompanyType[];
};

const CompanySwitcher = ({
  isCollapsed,
  defaultCompany,
  userCompanies,
}: CompanySwitcherProps) => {
  const router = useRouter();

  let avatarFallback = "T";
  const match = defaultCompany.name.match(/[a-zA-Zа-яА-Я]/);
  if (match) {
    avatarFallback = match[0].toUpperCase();
  }

  const switchToACompany = (value: string) => {
    const company = userCompanies.find((company) => company.id === value);
    if (!company) return;
    setCookie("user-company", company.id);
    router.refresh();
  };

  return (
    <Select onValueChange={switchToACompany} defaultValue={defaultCompany.id}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
        )}
      >
        <SelectValue>
          <Avatar className="h-7 w-7">
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className={cn("ml-2", isCollapsed && "hidden")}>
            {
              userCompanies.find((company) => company.id === defaultCompany.id)
                ?.name
            }
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {userCompanies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CompanySwitcher;
