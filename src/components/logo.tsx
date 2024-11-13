"use client";

import { Link } from "@/navigation";
import { Blocks } from "lucide-react";
import { useSession } from "next-auth/react";

const Logo = () => {
  const { status } = useSession();
  const authenticated = status === "authenticated";

  return (
    <Link href={authenticated ? "/dashboard" : "/"}>
      <div className="flex flex-row space-x-2">
        <Blocks />
        <div className="font-bold">Teklifo</div>
      </div>
    </Link>
  );
};

export default Logo;
