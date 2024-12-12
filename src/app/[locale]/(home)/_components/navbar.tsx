"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSwitch from "@/components/language-switch";
import RepositoryLink from "@/components/repository-link";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const t = useTranslations("Home");

  const scroll = useScrollPosition();

  const links = [
    {
      href: "#how-it-works",
      label: t("links.howItWorks"),
    },

    {
      href: "#client-features",
      label: t("links.clientFeatures"),
    },
    {
      href: "#ai-feature",
      label: t("links.aiFeature"),
    },
    {
      href: "#suppliers-hero-section",
      label: t("links.supplier"),
    },
  ];

  return (
    <div
      className={cn(
        scroll > 0
          ? "backdrop-filter bg-background/60 backdrop-blur-lg bg-clip-padding"
          : "bg-transparent border-transparent",
        "h-16 sticky top-0 transition-all duration-500 z-50 border"
      )}
    >
      <header className="relative">
        <MaxWidthWrapper>
          <div className="flex h-16 justify-between items-center">
            <Logo />
            <div className="space-x-4 hidden md:block">
              {links.map((link, index) => (
                <Link key={index} href={link.href} className="text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSwitch />
              <ThemeToggle />
              <RepositoryLink />
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
