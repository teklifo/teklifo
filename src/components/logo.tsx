import { Link } from "@/navigation";
import { Blocks } from "lucide-react";

const Logo = () => {
  return (
    <Link href="/">
      <div className="flex flex-row space-x-2">
        <Blocks />
        <div className="font-bold">Teklifo</div>
      </div>
    </Link>
  );
};

export default Logo;
