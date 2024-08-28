import { getTranslations } from "next-intl/server";
import { Company as CompanyType } from "@prisma/client";
import { Link } from "@/navigation";
import UserDropdown from "./user-dropdown";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import getCurrentUser from "@/app/actions/get-current-user";
import ThemeToggle from "@/components/theme-toggle";

type NavbarProps = {
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
};

const Navbar = async ({ defaultCompany, userCompanies }: NavbarProps) => {
  const t = await getTranslations("Layout");

  const user = await getCurrentUser();

  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16 border-b">
      <header className="relative bg-background border-b px-10">
        <div className="flex h-16 justify-between items-center">
          <Logo />
          <div className="flex flex-row space-x-2">
            {user ? (
              <UserDropdown
                user={user}
                defaultCompany={defaultCompany}
                userCompanies={userCompanies}
              />
            ) : (
              <Link
                href="/login"
                className={buttonVariants({ variant: "default" })}
              >
                {t("login")}
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;
