"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import queryString from "query-string";
import { BriefcaseBusiness, Loader, X } from "lucide-react";
import { Company as CompanyType } from "@prisma/client";
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
import request from "@/lib/request";
import useDebounce from "@/hooks/useDebounce";
import { PaginationType } from "@/types";
import CompanyRow from "./company-row";
import { Separator } from "@/components/ui/separator";

type PaginatedData = {
  result: CompanyType[];
  pagination: PaginationType;
};

const CompanyFilter = () => {
  const t = useTranslations("CompanyFilter");

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<CompanyType[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    current: 1,
    skipped: 0,
    total: 0,
  });
  const [page, setPage] = useState(1);

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
        page,
        query: debouncedValue,
      });

      try {
        const resonse = await request<PaginatedData>(
          `/api/company?limit=10&${queryParams}`,
          config
        );
        setCompanies(resonse.result);
        setPagination(resonse.pagination);
      } catch (error) {
        throw error;
      }

      setLoading(false);
    }

    getCompanies();
  }, [debouncedValue, page]);

  function removeCompany(company: CompanyType) {
    setSelectedCompanies((prevState) =>
      prevState.filter((element) => element.id !== company.id)
    );
  }

  function onOpenChange(open: boolean) {
    if (!open) {
      setSelectedCompanies([]);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BriefcaseBusiness className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{t("company")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-auto h-full flex flex-col md:h-[80vh] max-w-7xl">
        <DialogHeader>
          <DialogTitle>{t("company")}</DialogTitle>
          <DialogDescription>{t("hint")}</DialogDescription>
        </DialogHeader>
        <div className="h-full grid grid-cols-1 gap-0 md:grid-cols-12 md:gap-6">
          <div className="flex flex-col col-span-7">
            <div className="w-full space-y-2 mb-8">
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
            {loading ? (
              <div className="flex justify-center items-center flex-auto">
                <Loader className="mr-2 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col justify-between flex-auto">
                <div className="overflow-auto flex-auto space-y-4">
                  {companies.map((company) => (
                    <CompanyRow
                      key={company.id}
                      company={company}
                      checked={
                        selectedCompanies.find((e) => e.id === company.id) !==
                        undefined
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCompanies((prevState) => [
                            ...prevState,
                            company,
                          ]);
                        } else {
                          removeCompany(company);
                        }
                      }}
                    />
                  ))}
                </div>
                <PaginationBarClient
                  pagination={pagination}
                  onPageClick={(newPage) => {
                    setPage(newPage);
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col col-span-5 md:flex-row">
            <Separator className="w-full h-[0.5px] md:h-full md:w-[0.5px]" />
            <div className="h-fit p-2 flex flex-wrap overflow-auto">
              {selectedCompanies.map((company) => {
                return (
                  <Button
                    key={company.id}
                    variant="secondary"
                    className="m-2"
                    onClick={() => removeCompany(company)}
                  >
                    <span className="max-w-[200px] truncate">
                      {company.name}
                    </span>
                    <X className="ml-2 w-4 h-4 text-muted-foreground" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyFilter;
