import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
