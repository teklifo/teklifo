import { Prisma } from "@prisma/client";
import db from "../db";

export const upsertProduct = async (
  productData: Prisma.ProductUncheckedCreateInput,
  searchByAttributes: boolean = true
) => {
  let id = productData.id;

  if (!id && searchByAttributes) {
    const existingProduct = await db.product.findFirst({
      where: {
        AND: [
          {
            OR: [
              {
                externalId: productData.externalId
                  ? productData.externalId
                  : null,
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

    id = existingProduct?.id ?? 0;

    console.log(existingProduct);
  }

  return await db.product.upsert({
    where: {
      id,
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
