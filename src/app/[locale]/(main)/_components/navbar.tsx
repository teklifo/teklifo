import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Company as CompanyType } from "@prisma/client";
import UserDropdown from "./user-dropdown";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
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
          <div className="flex h-16 justify-between items-center">
            <Link href="/">
              <div className="">Teklifo</div>
            </Link>
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
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
