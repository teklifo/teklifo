"use client";

import { useTranslations } from "next-intl";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Company as CompanyType } from "@prisma/client";
import {
  LayoutGrid,
  UserCog,
  Users,
  Package,
  Warehouse,
  Coins,
  FileInput,
  BriefcaseBusiness,
  FileSearch,
  Import,
} from "lucide-react";
import Nav from "./nav";
import CompanySwitcher from "./company-switcher";
import { cn } from "@/lib/utils";

type MenuProps = {
  isCollapsed: boolean;
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
};

const Menu = ({ isCollapsed, defaultCompany, userCompanies }: MenuProps) => {
  const t = useTranslations("Layout");

  return defaultCompany ? (
    <div className="mt-2">
      <div
        className={cn(
          "flex h-[52px] items-center justify-center",
          isCollapsed ? "h-[52px]" : "px-2"
        )}
      >
        <CompanySwitcher
          isCollapsed={isCollapsed}
          defaultCompany={defaultCompany}
          userCompanies={userCompanies}
        />
      </div>
      <Separator />
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("dashboard"),
            label: "",
            icon: LayoutGrid,
            href: `/dashboard`,
          },
        ]}
      />
      <Separator />
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("rfqSearch"),
            label: "",
            icon: FileSearch,
            href: `/rfq`,
          },
        ]}
      />
      <Separator />
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("myRFQ"),
            label: "",
            icon: FileInput,
            href: `/my-rfq`,
          },
          {
            title: t("myQuotations"),
            label: "",
            icon: BriefcaseBusiness,
            href: "/my-quotations",
          },
        ]}
      />
      <Separator />
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("products"),
            label: "",
            icon: Package,
            href: `/products`,
          },
          {
            title: t("stocks"),
            label: "",
            icon: Warehouse,
            href: `/stocks`,
          },
          {
            title: t("priceTypes"),
            label: "",
            icon: Coins,
            href: `/price-types`,
          },
          {
            title: t("importData"),
            label: "",
            icon: Import,
            href: `/import-data`,
          },
        ]}
      />
      <Separator />
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("members"),
            label: "",
            icon: Users,
            href: `/members`,
          },
        ]}
      />
    </div>
  ) : (
    <div className="mt-8">
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("rfqSearch"),
            label: "",
            icon: FileSearch,
            href: `/rfq`,
          },
        ]}
      />
    </div>
  );
};

export default Menu;
