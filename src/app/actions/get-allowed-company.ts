import db from "@/lib/db";
import getCurrentUser from "./get-current-user";

export default async function getAllowedCompany(
  id: string,
  admin: boolean = true,
  defaultUserId?: string
) {
  let userId = "";

  if (defaultUserId) {
    userId = defaultUserId;
  } else {
    const user = await getCurrentUser();
    if (!user) return null;
    userId = user.id;
  }

  const company = await db.company.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        where: {
          userId,
          companyRole: admin
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
