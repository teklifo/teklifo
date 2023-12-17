import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PaginationType } from "@/types";

type PageLinkType = {
  href: string;
  page: number;
  isCurrent?: boolean;
  children: React.ReactNode;
};

const PageLink = ({
  href,
  page,
  isCurrent = false,
  children,
}: PageLinkType) => {
  return (
    <li>
      <Link
        href={`${href}${page}`}
        className={buttonVariants({
          variant: isCurrent ? "default" : "secondary",
        })}
      >
        {children}
      </Link>
    </li>
  );
};

const Pagination = ({
  href,
  pagination: { current, total, skipped },
}: {
  href: string;
  pagination: PaginationType;
}) => {
  if (total === 0) return null;

  return (
    <nav>
      <ul className="w-full flex flex-row justify-center items-center py-10 space-x-2">
        {skipped > 0 && (
          // Prev button
          <PageLink href={href} page={current - 1}>
            <ChevronLeft />
          </PageLink>
        )}
        {/* First Page */}
        {skipped > 0 && current - 3 > 1 && (
          <PageLink href={href} page={1}>
            1
          </PageLink>
        )}
        {/* Prev pages */}
        {skipped > 0 &&
          [...Array(Math.min(skipped, 3))].map((_x, i) => (
            <PageLink key={i} href={href} page={current - i - 1}>
              {`${current - i - 1}`}
            </PageLink>
          ))}
        {/* Current page */}
        <PageLink
          href={href}
          page={current}
          isCurrent={true}
        >{`${current}`}</PageLink>
        {/* Next pages */}
        {[...Array(Math.min(total - current, 3))].map((_x, i) => (
          <PageLink key={i} href={href} page={current + i + 1}>
            {`${current + i + 1}`}
          </PageLink>
        ))}
        {/* Last page */}
        {current + 3 < total && (
          <PageLink href={href} page={total}>
            {total}
          </PageLink>
        )}
        {/* Next button */}
        {current !== total && (
          <PageLink href={href} page={current + 1}>
            <ChevronRight />
          </PageLink>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
