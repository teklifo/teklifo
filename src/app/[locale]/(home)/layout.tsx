import Navbar from "./_components/navbar";
import Footer from "./_components/footer";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
