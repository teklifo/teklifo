import db from "@/lib/db";
import getCurrentUser from "./get-current-user";

export default async function getAllowedCompany(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const company = await db.company.findUnique({
    where: {
      id,
      users: {
        some: {
          userId: user.id,
          companyRole: {
            default: true,
          },
        },
      },
    },
    include: {
      users: {
        include: {
          companyRole: true,
        },
      },
    },
  });

  return company;
}
