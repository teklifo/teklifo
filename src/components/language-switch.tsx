"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname, locales } from "@/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function LanguageSwitch() {
  const locale = useLocale();

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function onSelectChange(nextLocale: string) {
    type LocaleValue = (typeof locales)[number];
    const currentLocale: LocaleValue = nextLocale as LocaleValue;

    startTransition(() => {
      router.replace(pathname, { locale: currentLocale });
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
