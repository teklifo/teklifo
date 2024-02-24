import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import getCurrentUser from "./get-current-user";

type UserType = Prisma.UserGetPayload<{
  include: {
    companies: {
      include: {
        companyRole: true;
      };
    };
  };
}>;

export async function getCurrentCompany() {
  const companyId = getCompanyIdFromCookies();
  if (!companyId) {
    return null;
  }
  const company = getUserCompany(companyId);

  return company;
}

function getCompanyIdFromCookies() {
  const cookieStore = cookies();
  const userCompanyCookie = cookieStore.get("user-company");
  const companyId = userCompanyCookie ? userCompanyCookie.value : null;
  return companyId;
}

export async function getUserCompany(companyId: string, userId?: string) {
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
        },
      },
    },
    include: {
      users: {
        where: {
          userId: searchUserId,
        },
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

export async function isCompanyAdmin(companyId: string, user?: UserType) {
  const searchUser = user ? user : await getCurrentUser();
  return (
    searchUser?.companies.find((company) => company.companyId === companyId)
      ?.companyRole.default || false
  );
}
