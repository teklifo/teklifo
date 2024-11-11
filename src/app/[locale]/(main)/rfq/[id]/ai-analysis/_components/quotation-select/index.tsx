"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import queryString from "query-string";
import { BriefcaseBusiness, Loader, X } from "lucide-react";
import QuotationCard from "@/components/quotation/quotation-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PaginationBarClient from "@/components/ui/pagintion-bar-client";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuotationsAIAnalysisStore } from "../../_store";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
import { PaginationType, QuotationWithCompanyType } from "@/types";

type PaginatedData = {
  result: QuotationWithCompanyType[];
  pagination: PaginationType;
};

type QuotationSelectProps = {
  rfqId: string;
};

const QuotationSelect = ({ rfqId }: QuotationSelectProps) => {
  const t = useTranslations("QuotationsAIAnalysis");

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [quotations, setQuotations] = useState<QuotationWithCompanyType[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    current: 1,
    skipped: 0,
    total: 0,
  });
  const [page, setPage] = useState(1);

  const selectedQuotations = useQuotationsAIAnalysisStore(
    (state) => state.quotations
  );

  const addQuotation = useQuotationsAIAnalysisStore(
    (state) => state.addQuotation
  );

  const removeQuotation = useQuotationsAIAnalysisStore(
    (state) => state.removeQuotation
  );

  const debouncedValue = useDebounce(query);

  useEffect(() => {
    async function getCompanies() {
      setLoading(true);

      const config = {
        headers: {
          "Accept-Language": getCookie("NEXT_LOCALE"),
        },
      };

      const queryParams = queryString.stringify({
        rfqId,
        query: debouncedValue,
        onlyRelevant: true,
        limit: 10,
        page,
      });

      try {
        const resonse = await request<PaginatedData>(
          `/api/quotation?${queryParams}`,
          config
        );
        setQuotations(resonse.result);
        setPagination(resonse.pagination);
      } catch (error) {
        throw error;
      }

      setLoading(false);
    }

    getCompanies();
  }, [debouncedValue, page, rfqId]);

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex flex-row justify-center items-center space-x-2"
        >
          <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          {selectedQuotations.length > 0 ? (
            <span>
              {t("selectedQuotations", { number: selectedQuotations.length })}
            </span>
          ) : (
            <span>{t("selectQuotations")}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-full md:h-auto overflow-auto max-w-7xl">
        <DialogHeader>
          <DialogTitle>{t("quotations")}</DialogTitle>
          <DialogDescription>{t("quotationsHint")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-6">
          <div className="flex flex-col col-span-7">
            <div className="space-y-2 mb-8">
              <Label htmlFor="query">{t("query")}</Label>
              <Input
                type="text"
                id="query"
                placeholder={t("queryHint")}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                value={query}
                autoComplete="off"
              />
            </div>
            <div className="h-full md:h-[60vh]">
              {loading ? (
                <div className="h-full flex justify-center items-center">
                  <Loader className="mr-2 animate-spin" />
                </div>
              ) : (
                <div className="h-full flex flex-col justify-between">
                  <ScrollArea>
                    <div className="space-y-4">
                      {quotations.length > 0 ? (
                        quotations.map((quotation) => {
                          const selected = selectedQuotations.find(
                            (selectedQuot) => selectedQuot.id === quotation.id
                          );
                          return (
                            <QuotationCard
                              key={quotation.id}
                              quotation={quotation}
                              onClick={() =>
                                selected
                                  ? removeQuotation(quotation)
                                  : addQuotation(quotation)
                              }
                              variant={selected ? "primary" : "default"}
                            />
                          );
                        })
                      ) : (
                        <div className="h-full w-full flex justify-center items-center">
                          <p className="text-sm text-muted-foreground">
                            {t("noResults")}
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <PaginationBarClient
                    pagination={pagination}
                    onPageClick={(newPage) => {
                      setPage(newPage);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col col-span-5">
            <div className="h-full md:h-[60vh]">
              <div className="h-full flex flex-col space-y-6 space-x-0 md:flex-row md:space-y-0 md:space-x-6">
                <Separator className="w-full h-[0.5px] md:h-full md:w-[0.5px]" />
                <div className="h-full w-full">
                  {selectedQuotations.length > 0 ? (
                    <div className="h-full flex flex-col justify-between">
                      <ScrollArea>
                        <div className="space-y-4">
                          {selectedQuotations.map((quotation) => {
                            return (
                              <div
                                key={quotation.id}
                                className="relative"
                                onClick={() => removeQuotation(quotation)}
                              >
                                <QuotationCard quotation={quotation} />
                                <X className="absolute top-0 right-0 m-4 w-4 h-4 text-muted-foreground cursor-pointer" />
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="h-full w-full flex justify-center items-center">
                      <p className="text-sm text-muted-foreground">
                        {t("selectQuotationHint")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => [setOpen(false)]}>{t("select")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationSelect;
