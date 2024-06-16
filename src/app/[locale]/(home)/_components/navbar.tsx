import MaxWidthWrapper from "@/components/max-width-wrapper";
import Logo from "@/components/logo";

const Navbar = async () => {
  return (
    <div className="h-16">
      <header className="relative">
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
