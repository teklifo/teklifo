"use client";

import { useTranslations } from "next-intl";
import { setCookie } from "cookies-next";
import { Link } from "@/navigation";
import { Plus } from "lucide-react";
import { Company as CompanyType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, getAvatarFallback } from "@/lib/utils";

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
  const t = useTranslations("Layout");

  const switchToACompany = (value: string) => {
    const company = userCompanies.find((company) => company.id === value);
    if (!company) return;
    setCookie("user-company", company.id, {
      expires: new Date(3999, 1, 1),
    });
    window.location.reload();
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
          <div className="relative w-7 h-7">
            <div className="absolute flex justify-center items-center">
              <Avatar className="h-7 w-7">
                <AvatarFallback>
                  {getAvatarFallback(defaultCompany.name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("ml-2", isCollapsed && "hidden")}>
                {
                  userCompanies.find(
                    (company) => company.id === defaultCompany.id
                  )?.name
                }
              </div>
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {userCompanies.map((company) => (
          <SelectItem key={company.id} value={company.id}>
            {company.name}
          </SelectItem>
        ))}
        <Separator className="my-1" />
        <Link
          href="/new-company"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full space-x-2 font-normal flex justify-start items-center"
          )}
        >
          <Plus className="w-4 h-4" />
          <span>{t("createCompany")}</span>
        </Link>
      </SelectContent>
    </Select>
  );
};

export default CompanySwitcher;
