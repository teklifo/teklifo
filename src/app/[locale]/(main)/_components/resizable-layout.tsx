"use client";

import { useState, useEffect } from "react";
import { deleteCookie, setCookie } from "cookies-next";
import { Company as CompanyType } from "@prisma/client";
import Menu from "./menu";
import Footer from "./footer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type ResizableLayoutProps = {
  defaultCollapsed: boolean;
  defaultLayout: number[] | undefined;
  defaultCompany: CompanyType | null;
  userCompanies: CompanyType[];
  children: React.ReactNode;
};

const ResizableLayout = ({
  defaultCollapsed,
  defaultLayout = [15, 85],
  defaultCompany,
  userCompanies,
  children,
}: ResizableLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  useEffect(() => {
    if (defaultCompany) {
      setCookie("user-company", defaultCompany.id, {
        expires: new Date(3999, 1, 1),
      });
    } else {
      deleteCookie("user-company");
    }
  }, [defaultCompany]);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          setCookie("react-resizable-panels-layout", sizes, {
            expires: new Date(3999, 1, 1),
          });
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
            setCookie("react-resizable-panels-collapsed", true, {
              expires: new Date(3999, 1, 1),
            });
          }}
          onExpand={() => {
            setIsCollapsed(false);
            setCookie("react-resizable-panels-collapsed", false, {
              expires: new Date(3999, 1, 1),
            });
          }}
          className={cn(
            "hidden xl:block",
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div className="h-full flex flex-col justify-between">
            <ScrollArea>
              <Menu
                isCollapsed={isCollapsed}
                defaultCompany={defaultCompany}
                userCompanies={userCompanies}
              />
            </ScrollArea>
            <Footer isCollapsed={isCollapsed} />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="hidden xl:flex" />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={30}
          className="!overflow-auto"
        >
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default ResizableLayout;
