"use client";

import { useTranslations } from "next-intl";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Company as CompanyType } from "@prisma/client";
import {
  LayoutGrid,
  Settings2,
  Users,
  ShoppingCart,
  Warehouse,
  Coins,
  FileInput,
  FileOutput,
} from "lucide-react";
import Nav from "./nav";
import CompanySwitcher from "./company-switcher";
import { cn } from "@/lib/utils";

type MenuProps = {
  isCollapsed: boolean;
  defaultCompany: CompanyType;
  userCompanies: CompanyType[];
};

const Menu = ({ isCollapsed, defaultCompany, userCompanies }: MenuProps) => {
  const t = useTranslations("Layout");

  return (
    <>
      <div
        className={cn(
          "flex h-[52px] items-center justify-center mt-2",
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
            title: t("main"),
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
            title: t("outgoingRfq"),
            label: "",
            icon: FileOutput,
            href: `/outgoing-rfq`,
          },
          {
            title: t("incomingRfq"),
            label: "",
            icon: FileInput,
            href: `/incoming-rfq`,
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
            icon: ShoppingCart,
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
        ]}
      />
      <Separator />
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: t("roles"),
            label: "",
            icon: Settings2,
            href: `/roles`,
          },
          {
            title: t("members"),
            label: "",
            icon: Users,
            href: `/members`,
          },
        ]}
      />
    </>
  );
};

export default Menu;
