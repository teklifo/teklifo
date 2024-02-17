"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { setCookie } from "cookies-next";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  LayoutGrid,
  Settings2,
  Users,
  ShoppingCart,
  Warehouse,
  Coins,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Nav } from "./nav";

type ResizableLayoutProps = {
  defaultCollapsed: boolean;
  defaultLayout: number[] | undefined;
  children: React.ReactNode;
};

const ResizableLayout = ({
  defaultCollapsed,
  defaultLayout = [265, 440, 655],
  children,
}: ResizableLayoutProps) => {
  const t = useTranslations("Company");

  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          setCookie("react-resizable-panels:layout", sizes);
        }}
        className="h-full max-h-[800px] items-stretch"
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
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            Hello
            {/* <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} /> */}
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
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default ResizableLayout;
