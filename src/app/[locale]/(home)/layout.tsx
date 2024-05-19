import Navbar from "./_components/navbar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default Layout;
