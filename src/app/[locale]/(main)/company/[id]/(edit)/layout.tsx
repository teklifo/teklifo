import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  params: { locale: string; id: string };
  children: React.ReactNode;
};

const Layout = ({ params: { id }, children }: Props) => {
  const t = useTranslations("Company");

  return (
    <div className="container mt-8">
      <div className="grid grid-cols-5 gap-3">
        <aside className="sticky top-0 hidden overflow-hidden p-2 md:flex md:flex-col md:justify-start md:items-start">
          <Link
            href={`/company/${id}/edit`}
            className={buttonVariants({ variant: "link" })}
          >
            <span>{t("main")}</span>
          </Link>
          <Link
            href={`/company/${id}/roles`}
            className={buttonVariants({ variant: "link" })}
          >
            <span>{t("roles")}</span>
          </Link>
          <Link
            href={`/company/${id}/members`}
            className={buttonVariants({ variant: "link" })}
          >
            <span>{t("members")}</span>
          </Link>
          <Link
            href={`/company/${id}/stocks`}
            className={buttonVariants({ variant: "link" })}
          >
            <span>{t("stocks")}</span>
          </Link>
          <Link
            href={`/company/${id}/priceTypes`}
            className={buttonVariants({ variant: "link" })}
          >
            <span>{t("priceTypes")}</span>
          </Link>
        </aside>
        <div className="md:col-span-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
