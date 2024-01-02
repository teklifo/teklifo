"use client";

import Link from "next/link";
import { usePathname } from "@/navigation";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CompanyLinksProps = {
  id: string;
};

const CompanyLinks = ({ id }: CompanyLinksProps) => {
  const t = useTranslations("Company");

  const pathname = usePathname();
  console.log(pathname);

  const links = [
    {
      href: `/company/${id}/edit`,
      label: t("main"),
    },
    {
      href: `/company/${id}/roles`,
      label: t("roles"),
    },
    {
      href: `/company/${id}/members`,
      label: t("members"),
    },
    {
      href: `/company/${id}/stocks`,
      label: t("stocks"),
    },
    {
      href: `/company/${id}/price-types`,
      label: t("priceTypes"),
    },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            buttonVariants({ variant: "link" }),
            link.href === pathname ? "bg-muted" : ""
          )}
        >
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  );
};

export default CompanyLinks;
