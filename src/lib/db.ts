import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

db.$extends({
  model: {
    user: {
      async delete({ where }: { where: { email: string } }) {
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
        console.log(1);
        return db.requestForQuotation.update({
          where: {
            ...where,
          },
          data: {
            deleted: true,
          },
        });
      },
      async deleteMany({ where }: { where: { versionId: string } }) {
        console.log(2);
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
        if (operation === "findUnique" || operation === "findMany") {
          args.where = { ...args.where, deleted: false };
        }
        return query(args);
      },
    },
  },
});

export default db;
