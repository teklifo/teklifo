import db from "@/lib/db";

export default async function getCompanies(companyIdList: string[]) {
  const result = await db.company.findMany({
    where: {
      id: {
        in: companyIdList,
      },
    },
  });

  return result;
}
