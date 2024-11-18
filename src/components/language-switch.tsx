"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LanguageSwitch() {
  const locale = useLocale();

  const locales = ["ru", "en"];

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="capitalize">
          {locale}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => onSelectChange(loc)}
            disabled={isPending}
          >
            <span className="capitalize">{loc}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitch;
