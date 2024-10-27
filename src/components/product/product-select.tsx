"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import queryString from "query-string";
import { Loader, Package } from "lucide-react";
import { Product as ProductType } from "@prisma/client";
import ProductCard from "./product-card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PaginationBarClient from "@/components/ui/pagintion-bar-client";
import request from "@/lib/request";
import useDebounce from "@/hooks/useDebounce";
import { ProductWithPricesAndStocks, PaginationType } from "@/types";

type PaginatedData = {
  result: ProductWithPricesAndStocks[];
  pagination: PaginationType;
};

type ProductSelectProps = {
  onSelect: (product: ProductType) => void;
};

const ProductSelect = ({ onSelect }: ProductSelectProps) => {
  const t = useTranslations("ProductSelect");

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductWithPricesAndStocks[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    current: 1,
    skipped: 0,
    total: 0,
  });

  const debouncedValue = useDebounce(query);

  useEffect(() => {
    async function getProducts() {
      setLoading(true);

      const config = {
        headers: {
          "Accept-Language": getCookie("NEXT_LOCALE"),
        },
      };

      const companyId = getCookie("user-company") || "";
      const queryParams = queryString.stringify({
        query: debouncedValue,
        limit: 10,
        page: 1,
      });

      try {
        const resonse = await request<PaginatedData>(
          `/api/company/${companyId}/product?${queryParams}`,
          config
        );
        setProducts(resonse.result);
        setPagination(resonse.pagination);
      } catch (error) {
        throw error;
      }

      setLoading(false);
    }

    getProducts();
  }, [debouncedValue]);

  async function pushToNewPage(pageNumber: number) {
    setLoading(true);

    const config = {
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
    };

    const companyId = getCookie("user-company") || "";
    const queryParams = queryString.stringify({
      query: debouncedValue,
      limit: 10,
      page: pageNumber,
    });

    try {
      const resonse = await request<PaginatedData>(
        `/api/company/${companyId}/product?${queryParams}`,
        config
      );
      setProducts(resonse.result);
      setPagination(resonse.pagination);
    } catch (error) {
      throw error;
    }

    setLoading(false);
  }

  return (
    <DialogContent className="h-full flex flex-col md:h-[80vh]">
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
      </DialogHeader>
      <div className="w-full space-y-2">
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
        <div className="flex justify-center items-center h-full">
          <Loader className="mr-2 animate-spin" />
        </div>
      ) : (
        <div className="overflow-auto space-y-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="h-auto">
                <ProductCard product={product}>
                  <Button
                    type="button"
                    onClick={() => {
                      onSelect(product);
                    }}
                  >
                    {t("select")}
                  </Button>
                </ProductCard>
              </div>
            ))
          ) : (
            <div className="mt-16 flex flex-col justify-center items-center py-2 space-y-2">
              <Package className="w-24 h-24 text-foreground" />
              <p className="leading-7 tracking-tight max-w-sm text-muted-foreground">
                {t("noResult")}
              </p>
            </div>
          )}
          <PaginationBarClient
            pagination={pagination}
            onPageClick={(newPage) => {
              pushToNewPage(newPage);
            }}
          />
        </div>
      )}
    </DialogContent>
  );
};

export default ProductSelect;
