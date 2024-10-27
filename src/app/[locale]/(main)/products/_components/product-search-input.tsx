"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import useDebounce from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import queryString from "query-string";

type ProductSearchInputProps = {
  defaultQuery?: string;
};

const ProductSearchInput = ({ defaultQuery }: ProductSearchInputProps) => {
  const t = useTranslations("CompanyProducts");

  const router = useRouter();

  const [query, setQuery] = useState(defaultQuery ?? "");
  const debouncedValue = useDebounce(query);

  useEffect(() => {
    const queryParams = queryString.stringify(
      {
        query: debouncedValue,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      }
    );
    router.push(`/products?${queryParams}`);
  }, [debouncedValue, router]);

  return (
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
  );
};

export default ProductSearchInput;
