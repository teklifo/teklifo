import db from "@/lib/db";

async function getAuthCallbackUrl(email: string) {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    include: {
      companies: true,
    },
  });

  return user && user.companies.length > 0 ? "/" : "/company-suggestion";
}

export default getAuthCallbackUrl;
