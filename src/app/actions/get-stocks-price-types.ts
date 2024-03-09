import { cookies, headers } from "next/headers";
import type {
  Stock as StockType,
  PriceType as PriceTypeType,
} from "@prisma/client";
import request from "@/lib/request";
import { PaginationType } from "@/types";
import getCurrentCompany from "./get-current-company";

export type StockPaginatedData = {
  result: StockType[];
  pagination: PaginationType;
};

export type PriceTypePaginatedData = {
  result: PriceTypeType[];
  pagination: PaginationType;
};

export const getStocksAndPriceTypes = async () => {
  const company = await getCurrentCompany();
  if (!company) return;

  const cookieStore = cookies();
  const headersList = headers();
  const cookie = headersList.get("cookie");

  const config = {
    method: "get",
    headers: {
      "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
      Cookie: cookie,
    },
    next: { revalidate: 0 },
  };

  try {
    const results = await Promise.all([
      await request<StockPaginatedData>(
        `/api/company/${company.id}/stock?page=1&limit=100`,
        config
      ),

      await request<PriceTypePaginatedData>(
        `/api/company/${company.id}/price-type?page=1&limit=100`,
        config
      ),
    ]);

    return results;
  } catch (error) {
    //
  }
};
