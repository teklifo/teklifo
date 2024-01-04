import { cookies, headers } from "next/headers";
import type {
  Stock as StockType,
  PriceType as PriceTypeType,
} from "@prisma/client";
import request from "@/lib/request";
import { PaginationType } from "@/types";

export type StockPaginatedData = {
  result: StockType[];
  pagination: PaginationType;
};

export type PriceTypePaginatedData = {
  result: PriceTypeType[];
  pagination: PaginationType;
};

export const getStocksAndPriceTypes = async (companyId: string) => {
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
        `/api/company/${companyId}/stock?page=1&limit=100`,
        config
      ),

      await request<PriceTypePaginatedData>(
        `/api/company/${companyId}/price-type?page=1&limit=100`,
        config
      ),
    ]);

    return results;
  } catch (error) {
    //
  }
};
