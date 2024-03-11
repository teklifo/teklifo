import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Company as CompanyType } from "@prisma/client";
import { MenuIcon } from "lucide-react";
import UserDropdown from "./user-dropdown";
import Menu from "./menu";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import getCurrentUser from "@/app/actions/get-current-user";

type NavbarProps = {
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
};

const Navbar = async ({ defaultCompany, userCompanies }: NavbarProps) => {
  const t = await getTranslations("Layout");

  const user = await getCurrentUser();

  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16 border-b">
      <header className="relative bg-background border-b">
        <MaxWidthWrapper>
          <div className="flex h-16 items-center">
            <div className="ml-4 space-x-2 flex items-center lg:ml-0">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="block 2xl:hidden">
                    <MenuIcon />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="px-2">
                  {defaultCompany && (
                    <Menu
                      isCollapsed={false}
                      defaultCompany={defaultCompany}
                      userCompanies={userCompanies}
                    />
                  )}
                </SheetContent>
              </Sheet>
              <Link href="/">
                <div className="">Teklifo</div>
              </Link>
            </div>
            <div className="ml-auto flex items-center">
              <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                {user ? (
                  <UserDropdown user={user} />
                ) : (
                  <Link
                    href="/login"
                    className={buttonVariants({ variant: "default" })}
                  >
                    {t("login")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
