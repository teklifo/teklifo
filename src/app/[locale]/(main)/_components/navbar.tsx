import { getTranslations } from "next-intl/server";
import { Company as CompanyType } from "@prisma/client";
import { Link } from "@/navigation";
import UserDropdown from "./user-dropdown";
import Logo from "@/components/logo";
import Sidebar from "./sidebar";
import { buttonVariants } from "@/components/ui/button";
import getCurrentUser from "@/app/actions/get-current-user";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSwitch from "@/components/language-switch";

type NavbarProps = {
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
};

const Navbar = async ({ defaultCompany, userCompanies }: NavbarProps) => {
  const t = await getTranslations("Layout");

  const user = await getCurrentUser();

  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16 border-b">
      <header className="relative bg-background border-b px-2 md:px-10">
        <div className="flex h-16 justify-between items-center">
          <Logo />
          <div className="flex flex-row space-x-2">
            <div className="block xl:hidden">
              <Sidebar
                user={user || undefined}
                defaultCompany={defaultCompany}
                userCompanies={userCompanies}
              />
            </div>
            <div className="hidden xl:flex justify-center items-center space-x-2">
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
              <div className="flex items-center space-x-2">
                <LanguageSwitch />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
