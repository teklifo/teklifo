import Link from "next/link";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import UserDropdown from "@/components/user-dropdown";
import { buttonVariants } from "@/components/ui/button";
import getCurrentUser from "@/app/actions/get-current-user";

const Navbar = async () => {
  const t = await getTranslations("Layout");

  const user = await getCurrentUser();

  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16 border-b">
      <header className="relative bg-background border-b">
        <MaxWidthWrapper>
          <div className="flex h-16 items-center">
            <div className="ml-4 flex lg:ml-0">
              <Link href="/">
                <div className="">KRAFT</div>
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
