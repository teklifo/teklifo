"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import queryString from "query-string";
import ProductCard from "./product-card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import request from "@/lib/request";
import useDebounce from "@/hooks/useDebounce";
import { ProductWithPricesAndStocks, PaginationType } from "@/types";
import { Label } from "@radix-ui/react-label";

type SearchParams = {
  page?: number;
  query?: string;
};

type PaginatedData = {
  result: ProductWithPricesAndStocks[];
  pagination: PaginationType;
};

const ProductSelect = () => {
  const t = useTranslations("ProductSelect");

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductWithPricesAndStocks[]>([]);

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
        page: 1,
        query: debouncedValue,
      });

      try {
        const resonse = await request<PaginatedData>(
          `/api/company/${companyId}/product?limit=10&${queryParams}`,
          config
        );
        setProducts(resonse.result);
      } catch (error) {
        throw error;
      }

      setLoading(false);
    }

    getProducts();
  }, [debouncedValue]);

  return (
    <DialogContent>
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
            console.log(debouncedValue);
          }}
          value={query}
          autoComplete="off"
        />
      </div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </DialogContent>
  );
};

export default ProductSelect;
