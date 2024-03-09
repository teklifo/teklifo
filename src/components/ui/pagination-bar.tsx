import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PaginationType } from "@/types";

const PaginationBar = ({
  href,
  pagination: { current, total, skipped },
}: {
  href: string;
  pagination: PaginationType;
}) => {
  if (total === 0) return null;

  return (
    <Pagination>
      <PaginationContent className="w-full flex flex-row justify-center items-center py-10 space-x-2">
        {skipped > 0 && (
          // Prev button
          <PaginationItem>
            <PaginationPrevious href={`${href}${current - 1}`} />
          </PaginationItem>
        )}
        {/* First Page */}
        {skipped > 0 && current - 3 > 1 && (
          <PaginationItem>
            <PaginationLink href={`${href}${1}`}>1</PaginationLink>
          </PaginationItem>
        )}
        {/* Prev pages */}
        {skipped > 0 &&
          [...Array(Math.min(skipped, 3))].map((_x, i) => (
            <PaginationItem key={i}>
              <PaginationLink href={`${href}${current - i - 1}`}>
                {`${current - i - 1}`}
              </PaginationLink>
            </PaginationItem>
          ))}
        {/* Current page */}
        <PaginationItem>
          <PaginationLink
            href={`${href}${current}`}
            isActive={true}
          >{`${current}`}</PaginationLink>
        </PaginationItem>
        {/* Next pages */}
        {[...Array(Math.min(total - current, 3))].map((_x, i) => (
          <PaginationItem key={i}>
            <PaginationLink href={`${href}${current + i + 1}`}>
              {`${current + i + 1}`}
            </PaginationLink>
          </PaginationItem>
        ))}
        {/* Last page */}
        {current + 3 < total && (
          <PaginationItem>
            <PaginationLink href={`${href}${total}`}>{total}</PaginationLink>
          </PaginationItem>
        )}
        {/* Next button */}
        {current !== total && (
          <PaginationItem>
            <PaginationNext href={`${href}${current + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationBar;
