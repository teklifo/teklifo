import { headers, cookies } from "next/headers";
import type { Prisma } from "@prisma/client";
import request from "@/lib/request";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  select: {
    id: true;
    company: true;
    participants: true;
    privateRequest: true;
    createdAt: true;
  };
}>;

export default async function getRFQPreview(rfqId: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<RequestForQuotationType>(`/api/rfq/${rfqId}/preview`, {
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
