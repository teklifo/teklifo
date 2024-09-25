import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSwitch from "@/components/language-switch";

const Navbar = async () => {
  const t = await getTranslations("Layout");

  return (
    <div className="h-16">
      <header className="relative">
        <MaxWidthWrapper>
          <div className="flex h-16 justify-between items-center">
            <Logo />
            <div className="flex items-center space-x-2">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
