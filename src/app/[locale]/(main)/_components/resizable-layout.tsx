"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { deleteCookie, setCookie } from "cookies-next";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  LayoutGrid,
  Settings2,
  Users,
  ShoppingCart,
  Warehouse,
  Coins,
} from "lucide-react";
import { Company as CompanyType } from "@prisma/client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Nav from "./nav";
import CompanySwitcher from "./company-switcher";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ResizableLayoutProps = {
  defaultCollapsed: boolean;
  defaultLayout: number[] | undefined;
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
  children: React.ReactNode;
};

const ResizableLayout = ({
  defaultCollapsed,
  defaultLayout = [265, 440, 655],
  defaultCompany,
  userCompanies,
  children,
}: ResizableLayoutProps) => {
  const t = useTranslations("Company");

  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    if (defaultCompany) {
      setCookie("user-company", defaultCompany.id);
    } else {
      deleteCookie("user-company");
    }
  }, [defaultCompany]);

  return defaultCompany ? (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          setCookie("react-resizable-panels:layout", sizes);
        }}
        className="!h-[calc(100vh-4rem)] items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={4}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            setCookie("react-resizable-panels:collapsed", true);
          }}
          onExpand={() => {
            setIsCollapsed(false);
            setCookie("react-resizable-panels:collapsed", false);
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
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
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={30}
          className="!overflow-auto"
        >
          <div className="container mt-8">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  ) : (
    <>{children}</>
  );
};

export default ResizableLayout;
