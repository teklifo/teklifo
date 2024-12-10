"use client";

import { useTranslations } from "next-intl";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSwitch from "@/components/language-switch";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const t = useTranslations("Layout");

  const scroll = useScrollPosition();

  return (
    <div
      className={cn(
        scroll > 0
          ? "backdrop-filter backdrop-blur-lg bg-opacity-20 bg-clip-padding"
          : "bg-transparent border-transparent",
        "h-16 sticky top-0 transition-all duration-500 z-50 border"
      )}
    >
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
