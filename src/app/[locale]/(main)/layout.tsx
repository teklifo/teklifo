import { cookies } from "next/headers";
import Navbar from "./_components/navbar";
import ResizableLayout from "./_components/resizable-layout";
import getCurrentUser from "@/app/actions/get-current-user";
import db from "@/lib/db";
import { getCurrentCompany } from "@/app/actions/get-current-company";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const layout = cookies().get("react-resizable-panels:layout");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  const user = await getCurrentUser();
  const userCompanies = user
    ? await db.company.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          users: {
            include: {
              companyRole: {
                include: {
                  availableData: true,
                },
              },
            },
          },
        },
      })
    : [];

  let defaultCompany = await getCurrentCompany();
  if (!defaultCompany && userCompanies.length > 0) {
    defaultCompany = userCompanies[0];
  }

  return (
    <>
      <Navbar />

      <ResizableLayout
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        defaultCompany={defaultCompany}
        userCompanies={userCompanies}
      >
        {children}
      </ResizableLayout>
    </>
  );
};

export default Layout;
