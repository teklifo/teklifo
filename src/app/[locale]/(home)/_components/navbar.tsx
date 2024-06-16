import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";

const Navbar = async () => {
  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-background">
        <MaxWidthWrapper>
          <div className="flex h-16 justify-between items-center">
            <Logo />
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
