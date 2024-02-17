import { cookies } from "next/headers";
import Navbar from "./_components/navbar";
import ResizableLayout from "./_components/resizable-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const layout = cookies().get("react-resizable-panels:layout");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <>
      <Navbar />
      <ResizableLayout
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
      >
        {children}
      </ResizableLayout>
    </>
  );
};

export default Layout;
