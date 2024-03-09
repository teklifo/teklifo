"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { PaginationType } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PaginationBarClient = ({
  onPageClick: onPageClick,
  pagination: { current, total, skipped },
}: {
  onPageClick: (page: number) => void;
  pagination: PaginationType;
}) => {
  if (total === 0) return null;

  return (
    <Pagination>
      <PaginationContent className="w-full flex flex-row justify-center items-center py-10 space-x-2">
        {skipped > 0 && (
          // Prev button
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => {
                onPageClick(current - 1);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </PaginationItem>
        )}
        {/* First Page */}
        {skipped > 0 && current - 3 > 1 && (
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => {
                onPageClick(1);
              }}
            >
              1
            </Button>
          </PaginationItem>
        )}
        {/* Prev pages */}
        {skipped > 0 &&
          [...Array(Math.min(skipped, 3))].map((_x, i) => (
            <PaginationItem key={i}>
              <Button
                variant="ghost"
                onClick={() => {
                  onPageClick(current - i - 1);
                }}
              >
                {current - i - 1}
              </Button>
            </PaginationItem>
          ))}
        {/* Current page */}
        <PaginationItem>
          <Button
            variant="outline"
            onClick={() => {
              onPageClick(current);
            }}
          >
            {current}
          </Button>
        </PaginationItem>
        {/* Next pages */}
        {[...Array(Math.min(total - current, 3))].map((_x, i) => (
          <PaginationItem key={i}>
            <Button
              variant="ghost"
              onClick={() => {
                onPageClick(current + i + 1);
              }}
            >
              {current + i + 1}
            </Button>
          </PaginationItem>
        ))}
        {/* Last page */}
        {current + 3 < total && (
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => {
                onPageClick(total);
              }}
            >
              {total}
            </Button>
          </PaginationItem>
        )}
        {/* Next button */}
        {current !== total && (
          <PaginationItem>
            <Button
              variant="ghost"
              onClick={() => {
                onPageClick(current + 1);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationBarClient;
