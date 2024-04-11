"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import type { User as UserType, Company as CompanyType } from "@prisma/client";
import { Building2, Settings, LogOut } from "lucide-react";
import { Link } from "@/navigation";
import Menu from "./menu";
import Nav from "./nav";
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
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getAvatarFallback } from "@/lib/utils";

interface UserDropdownProps {
  user: UserType;
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
}

const UserDropdown = ({
  user,
  defaultCompany,
  userCompanies,
}: UserDropdownProps) => {
  const t = useTranslations("Layout");

  const [open, setOpen] = useState(false);

  const userName = user.name || user.email || "Teklifo";

  const logout = () => {
    setOpen(false);
    signOut();
  };

  return (
    <>
      <div className="block 2xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="space-x-2">
              <Avatar>
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
              </Avatar>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="px-2 py-8">
            <div className="flex flex-col justify-center items-center space-y-2">
              <Avatar>
                <AvatarImage src={user.image ?? ""} />
                <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
              </Avatar>
              <span>{userName}</span>
            </div>
            <Nav
              isCollapsed={false}
              links={[
                {
                  title: t("myCompanies"),
                  label: "",
                  icon: Building2,
                  href: `/my-companies`,
                },
                {
                  title: t("settings"),
                  label: "",
                  icon: Settings,
                  href: `/settings`,
                },
              ]}
            />
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full text-left"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </Button>
            {defaultCompany && (
              <>
                <Separator className="my-6" />
                <Menu
                  isCollapsed={false}
                  defaultCompany={defaultCompany}
                  userCompanies={userCompanies}
                />
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden 2xl:block">
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
                <Building2 className="mr-2 h-4 w-4" />
                <Link
                  href="/my-companies"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {t("myCompanies")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <Link
                  href="/settings"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {t("settings")}
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
      </div>
    </>
  );
};

export default UserDropdown;
