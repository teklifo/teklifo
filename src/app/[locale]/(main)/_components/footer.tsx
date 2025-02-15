import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Link } from "@/navigation";
import { LogIn } from "lucide-react";
import FooterMenu from "./footer-menu";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FooterProps = {
  isCollapsed: boolean;
};

const Footer = ({ isCollapsed }: FooterProps) => {
  const t = useTranslations("Layout");
  const { status } = useSession();
  const authenticated = status === "authenticated";

  return isCollapsed ? (
    <div className="mb-6 px-2 flex flex-col justify-center items-center gap-4">
      {!authenticated && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "h-9 w-9"
              )}
            >
              <LogIn className="h-4 w-4" />
              <span className="sr-only">{t("login")}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {t("login")}
          </TooltipContent>
        </Tooltip>
      )}
      <FooterMenu />
    </div>
  ) : (
    <div className="space-y-2">
      {!authenticated && (
        <div className="mb-6 px-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight text-base">
                {t("join")}
              </CardTitle>
              <CardDescription>{t("joinHint")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "w-full"
                )}
              >
                {t("login")}
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator className="w-full" />
      <div className="p-3 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{`${format(
          new Date(),
          "yyyy"
        )} Teklifo`}</p>
        <FooterMenu />
      </div>
    </div>
  );
};

export default Footer;
