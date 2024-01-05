"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { User as UserType } from "@prisma/client";
import { Building2, LogOut } from "lucide-react";
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

interface UserDropdownProps {
  user: UserType;
}

const UserDropdown = ({ user }: UserDropdownProps) => {
  const t = useTranslations("Layout");

  const [open, setOpen] = useState(false);

  const userName = user.name || user.email || "Kraft";

  let avatarFallback = "K";
  const match = userName.match(/[A-Za-z]/);
  if (match) {
    avatarFallback = match[0].toUpperCase();
  }

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
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <span>{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Building2 className="mr-2 h-4 w-4" />
            <Link
              href="/my-companies"
              onClick={() => {
                setOpen(false);
              }}
            >
              {t("myCompanies")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <button onClick={logout} className="w-full text-left">
              {t("logout")}
            </button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
