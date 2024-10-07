import { Prisma } from "@prisma/client";
import db from "../db";

export const upsertProduct = async (
  productData: Prisma.ProductUncheckedCreateInput
) => {
  const existingProduct = await db.product.findFirst({
    where: {
      AND: [
        {
          OR: [
            {
              externalId: productData.externalId,
            },
            {
              number: productData.number,
            },
          ],
        },
        {
          companyId: productData.companyId,
        },
      ],
    },
  });

  return await db.product.upsert({
    where: {
      id: existingProduct?.id ?? 0,
    },
    create: productData,
    update: productData,
    include: {
      images: true,
    },
  });
};

export const upsertBalance = async (
  data: Prisma.StockBalanceUncheckedCreateInput
) => {
  return await db.stockBalance.upsert({
    where: {
      stockId_productId: {
        stockId: data.stockId,
        productId: data.productId,
      },
    },
    update: data,
    create: data,
  });
};

export const upsertPrices = async (data: Prisma.PriceUncheckedCreateInput) => {
  return await db.price.upsert({
    where: {
      priceTypeId_productId: {
        priceTypeId: data.priceTypeId,
        productId: data.productId,
      },
    },
    update: data,
    create: data,
  });
};
