import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";

const Navbar = async () => {
  const t = await getTranslations("Layout");

  return (
    <div className="h-16">
      <header className="relative">
        <MaxWidthWrapper>
          <div className="flex h-16 justify-between items-center">
            <div className="flex flex-row space-x-16">
              <Logo />
              <nav className="flex items-center gap-4 text-sm lg:gap-6">
                <Link
                  href="/rfq"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {t("rfqSearch")}
                </Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
