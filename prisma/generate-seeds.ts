import fs from "fs";
import db from "@/lib/db";

async function generateSeeds() {
  const account = await db.account.findMany({});
  await fs.promises.writeFile(
    "./prisma/seeds/account.json",
    JSON.stringify(account)
  );

  const user = await db.user.findMany({});
  await fs.promises.writeFile("./prisma/seeds/user.json", JSON.stringify(user));

  const company = await db.company.findMany({});
  await fs.promises.writeFile(
    "./prisma/seeds/company.json",
    JSON.stringify(company)
  );

  const companyRole = await db.companyRole.findMany({});
  await fs.promises.writeFile(
    "./prisma/seeds/companyRole.json",
    JSON.stringify(companyRole)
  );

  const companyMembers = await db.companyMembers.findMany({});
  await fs.promises.writeFile(
    "./prisma/seeds/companyMembers.json",
    JSON.stringify(companyMembers)
  );
}

generateSeeds();
