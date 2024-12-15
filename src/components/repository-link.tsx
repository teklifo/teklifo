import { Link } from "@/navigation";
import ThemedImage from "./themed-image";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

const RepositoryLink = () => {
  return (
    <Link
      href="https://github.com/teklifo/teklifo"
      target="_blank"
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "space-x-2"
      )}
    >
      <div>
        <ThemedImage
          src="/icons/light/github.svg"
          alt="GitHub"
          priority
          width={24}
          height={24}
        />
      </div>
    </Link>
  );
};

export default RepositoryLink;
