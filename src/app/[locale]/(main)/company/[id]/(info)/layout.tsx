import { getTranslations } from "next-intl/server";
import CompanyLinks from "@/app/[locale]/(main)/company/[id]/(info)/_components/company-links";
import CompanySwitch from "./_components/company-switch";
import getCurrentUser from "@/app/actions/get-current-user";
import db from "@/lib/db";

type Props = {
  params: { locale: string; id: string };
  children: React.ReactNode;
};

const Layout = async ({ params: { id }, children }: Props) => {
  const t = getTranslations("Company");

  const user = await getCurrentUser();
  const companies = user
    ? await db.company.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      })
    : [];

  return (
    <div className="container mt-8">
      {user ? (
        <div className="grid grid-cols-5 gap-3">
          <aside className="sticky top-0 hidden overflow-hidden p-2 md:flex md:flex-col md:justify-start md:items-start">
            <CompanySwitch id={id} companies={companies} />
            <CompanyLinks id={id} />
          </aside>
          <div className="col-span-5 md:col-span-4">{children}</div>
        </div>
      ) : (
        <>{children}</>
      )}
    </div>
  );
};

export default Layout;
