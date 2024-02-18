import { cookies } from "next/headers";
import db from "@/lib/db";
import getCurrentUser from "./get-current-user";

export async function getCurrentCompany() {
  const cookieStore = cookies();
  const userCompanyCookie = cookieStore.get("user-company");
  const companyId = userCompanyCookie ? userCompanyCookie.value : null;
  if (!companyId) {
    return null;
  }
  const company = getUserCompany(companyId);

  return company;
}

export default async function getUserCompany(
  companyId: string,
  isAdmin: boolean = true,
  userId?: string
) {
  let searchUserId = "";

  if (userId) {
    searchUserId = userId;
  } else {
    const user = await getCurrentUser();
    if (!user) return null;
    searchUserId = user.id;
  }

  const company = await db.company.findUnique({
    where: {
      id: companyId,
      users: {
        some: {
          userId: searchUserId,
          companyRole: isAdmin
            ? {
                default: true,
              }
            : undefined,
        },
      },
    },
    include: {
      users: {
        include: {
          companyRole: {
            include: {
              availableData: true,
            },
          },
        },
      },
    },
  });

  return company;
}
