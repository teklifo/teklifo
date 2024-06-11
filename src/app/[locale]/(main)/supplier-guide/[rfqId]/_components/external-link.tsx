import { Link } from "@/navigation";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
};

function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex justify-center items-center space-x-1"
    >
      <span className="underline underline-offset-4">{children}</span>
      <ExternalLinkIcon className="w-4 h-4" />
    </Link>
  );
}

export default ExternalLink;
