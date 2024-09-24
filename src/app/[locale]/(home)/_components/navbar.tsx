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
            <Logo />
            <ThemeToggle />
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
