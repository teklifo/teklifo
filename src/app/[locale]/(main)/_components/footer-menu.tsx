import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { EllipsisVertical, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ThemedImage from "@/components/themed-image";

const FooterMenu = () => {
  const t = useTranslations("Layout");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <a
            href={`mailto: ${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
            className="flex items-center w-full space-x-2"
          >
            <Mail className="w-4 -h-4" />
            <span>{t("contact")}</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="https://github.com/teklifo/teklifo"
            target="_blank"
            className="flex items-center w-full space-x-2"
          >
            <div>
              <ThemedImage
                src="/icons/light/github.svg"
                alt="GitHub"
                priority
                width={16}
                height={16}
              />
            </div>
            <span>{t("github")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FooterMenu;
