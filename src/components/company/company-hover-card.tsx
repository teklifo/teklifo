"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Company as CompanyType } from "@prisma/client";
import { Link } from "@/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getAvatarFallback } from "@/lib/utils";

type CompanyHoverCard = {
  company: CompanyType;
};

const CompanyHoverCard = ({
  company: { id, name, tin, slogan, sloganRu },
}: CompanyHoverCard) => {
  const t = useTranslations("Company");

  const currentLocale = useLocale();

  let sloganText = slogan;
  if (currentLocale === "ru" && sloganRu) {
    sloganText = sloganRu;
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={`/company/${id}`}
          className="scroll-m-20 underline text-lg font-semibold tracking-tight break-all"
        >
          {name}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex space-x-4">
          <Avatar>
            <AvatarFallback>{getAvatarFallback(name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{name}</h4>
            <span className="text-xs text-muted-foreground">{`${t(
              "tin"
            )}: ${tin}`}</span>
            {sloganText && <p className="text-sm">{sloganText}</p>}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default CompanyHoverCard;
