import db from "@/lib/db";
import getCurrentUser from "./get-current-user";

export default async function getAllowedCompany(
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
    },
    include: {
      users: {
        where: {
          userId: searchUserId,
          companyRole: isAdmin
            ? {
                default: true,
              }
            : undefined,
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
