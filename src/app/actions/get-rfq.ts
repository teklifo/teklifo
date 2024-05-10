import { headers, cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import request from "@/lib/request";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
    products: {
      include: {
        product: true;
      };
    };
    participants: true;
  };
}>;

export default async function getRFQ(id: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<RequestForQuotationType>(`/api/rfq/${id}`, {
      headers: {
        "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
        Cookie: cookie,
      },
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
}
