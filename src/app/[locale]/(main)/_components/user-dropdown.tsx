"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { User as UserType, Company as CompanyType } from "@prisma/client";
import { Building2, Settings, LogOut } from "lucide-react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarFallback } from "@/lib/utils";

interface UserDropdownProps {
  user: UserType;
}

const UserDropdown = ({ user }: UserDropdownProps) => {
  const t = useTranslations("Layout");

  const [open, setOpen] = useState(false);

  const userName = user.name || user.email || "";

  const logout = () => {
    setOpen(false);
    signOut();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="space-x-2">
          <Avatar>
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
          </Avatar>
          <span>{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              href="/my-companies"
              className="flex items-center w-full"
              onClick={() => {
                setOpen(false);
              }}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>{t("myCompanies")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href="/settings"
              className="flex items-center w-full"
              onClick={() => {
                setOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>{t("settings")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <button
              onClick={logout}
              className="flex items-center w-full text-left"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("logout")}</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
