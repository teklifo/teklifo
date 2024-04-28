import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: ReturnType<typeof createPrisma>;
}

function createPrisma() {
  return new PrismaClient().$extends({
    model: {
      user: {
        async delete({ where }: { where: { email?: string; id: string } }) {
          return db.user.update({
            where: {
              ...where,
            },
            data: {
              deleted: true,
            },
          });
        },
      },
      company: {
        async delete({ where }: { where: { id: string } }) {
          return db.company.update({
            where: {
              ...where,
            },
            data: {
              deleted: true,
            },
          });
        },
      },
      product: {
        async delete({ where }: { where: { id: number } }) {
          return db.product.update({
            where: {
              ...where,
            },
            data: {
              deleted: true,
            },
          });
        },
      },
      requestForQuotation: {
        async delete({ where }: { where: { versionId: string } }) {
          return db.requestForQuotation.update({
            where: {
              ...where,
            },
            data: {
              deleted: true,
            },
          });
        },
        async deleteMany({
          where,
        }: {
          where: { versionId?: string; id?: string };
        }) {
          return db.requestForQuotation.updateMany({
            where: {
              ...where,
            },
            data: {
              deleted: true,
            },
          });
        },
      },
    },
    query: {
      user: {
        async $allOperations({ operation, args, query }) {
          if (operation === "findUnique" || operation === "findMany") {
            args.where = { ...args.where, deleted: false };
          }
          return query(args);
        },
      },
      company: {
        async $allOperations({ operation, args, query }) {
          if (operation === "findUnique" || operation === "findMany") {
            args.where = { ...args.where, deleted: false };
          }
          return query(args);
        },
      },
      product: {
        async $allOperations({ operation, args, query }) {
          if (operation === "findUnique" || operation === "findMany") {
            args.where = { ...args.where, deleted: false };
          }
          return query(args);
        },
      },
      requestForQuotation: {
        async $allOperations({ operation, args, query }) {
          if (
            operation === "findUnique" ||
            operation === "findMany" ||
            operation === "findFirst"
          ) {
            args.where = { ...args.where, deleted: false };
          }
          return query(args);
        },
      },
    },
  });
}

export const db = globalThis.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

export default db;
