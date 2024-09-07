"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import type { User as UserType, Company as CompanyType } from "@prisma/client";
import { Building2, Settings, LogOut, MenuIcon } from "lucide-react";
import Menu from "./menu";
import Nav from "./nav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "@/components/theme-toggle";
import { getAvatarFallback } from "@/lib/utils";

interface SidebarProps {
  user?: UserType;
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
}

const Sidebar = ({ user, defaultCompany, userCompanies }: SidebarProps) => {
  const t = useTranslations("Layout");

  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const userName = user?.name || user?.email || "Teklifo";

  const logout = () => {
    setOpen(false);
    signOut();
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={(value) => setOpen(value)}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="space-x-2"
          onClick={() => setOpen(true)}
        >
          <div className="block md:hiddent">
            <MenuIcon />
          </div>
          <div className="hidden md:block">
            <Avatar>
              <AvatarImage src={user?.image ?? ""} />
              <AvatarFallback>{getAvatarFallback(userName)}</AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="px-2 py-8 overflow-auto">
        {user ? (
          <>
            <div className="flex flex-col justify-center items-center space-y-2">
              <Avatar>
                <AvatarImage src={user?.image ?? ""} />
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
          </>
        ) : (
          <div className="flex justify-center items-center">
            <Link
              href="/login"
              className={buttonVariants({ variant: "default" })}
            >
              {t("login")}
            </Link>
          </div>
        )}
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
        <Separator className="my-6" />
        <div className="flex flex-row justify-center items-center">
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
