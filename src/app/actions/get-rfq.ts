import { headers, cookies } from "next/headers";
import request from "@/lib/request";
import { RequestForQuotationType } from "@/types";

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
