import { useTranslations } from "next-intl";
import CompanyLinks from "@/components/company-links";

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
          <CompanyLinks id={id} />
        </aside>
        <div className="col-span-5 md:col-span-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
