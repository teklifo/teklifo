import { z } from "zod";
import { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { getRFQSchema } from "@/lib/schemas";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: true;
    participants: true;
  };
}>;

type CompanyType = Prisma.CompanyGetPayload<{
  include: {
    users: true;
  };
}>;

const schema = getRFQSchema((_) => "");

export function checkRfqItemsChanged(
  currentRfqVersion: RFQType,
  data: z.infer<typeof schema>
) {
  let rfqItemsChanged =
    currentRfqVersion.items.length !== data.items.length ||
    currentRfqVersion.currency !== data.currency;

  if (!rfqItemsChanged) {
    const changedItem = currentRfqVersion.items.find((item) => {
      const updatedItem = data.items.find(
        (existingProduct) => existingProduct.id === item.id
      );

      if (!updatedItem) return true;

      return (
        (item.productId &&
          updatedItem.productId &&
          item.productId !== updatedItem.productId) ||
        item.productName !== updatedItem.productName ||
        Number(item.quantity) !== updatedItem.quantity ||
        Number(item.price) !== updatedItem.price ||
        item.deliveryDate.toISOString() !==
          updatedItem.deliveryDate.toISOString()
      );
    });

    rfqItemsChanged = changedItem !== undefined;
  }

  return rfqItemsChanged;
}

export async function createNewRfqVersion(
  currentRfqVersion: RFQType,
  rfqData: z.infer<typeof schema>,
  company: CompanyType
) {
  const {
    externalId,
    title,
    privateRequest,
    currency,
    endDate,
    contactPerson,
    email,
    phone,
    description,
    deliveryAddress,
    deliveryTerms,
    paymentTerms,
    items,
  } = rfqData;

  // Prev version is not latest anymore
  await db.requestForQuotation.update({
    where: {
      versionId: currentRfqVersion.versionId,
    },
    data: {
      latestVersion: false,
    },
  });

  // Create new version of RFQ
  const newRfqVersion = await db.requestForQuotation.create({
    data: {
      id: currentRfqVersion.id,
      number: currentRfqVersion.number,
      externalId,
      companyId: company.id,
      userId: company.users[0].userId,
      title,
      privateRequest,
      currency,
      endDate: endDate,
      contactPerson,
      email,
      phone,
      description,
      deliveryAddress,
      deliveryTerms,
      paymentTerms,
      participants: {
        createMany: {
          data: currentRfqVersion.participants.map((e) => ({
            companyId: e.companyId,
          })),
        },
      },
    },
  });

  const itemsDataUnfiltered = items.map((item, index) => {
    const existingRfqItem = currentRfqVersion.items.find(
      (existingProduct) => existingProduct.id === item.id
    );
    if (item.id && !existingRfqItem) return null;

    const productData: Prisma.RequestForQuotationItemCreateManyInput = {
      id: existingRfqItem ? existingRfqItem.id : undefined,
      requestForQuotationId: newRfqVersion.versionId,
      productName: item.productName,
      productId: item.productId,
      lineNumber: index++,
      externalId: item.externalId,
      price: item.price,
      quantity: item.quantity,
      deliveryDate: item.deliveryDate,
      comment: item.comment,
    };

    return productData;
  });

  const itemsData: Prisma.RequestForQuotationItemCreateManyInput[] =
    itemsDataUnfiltered.filter(
      (
        productData
      ): productData is Prisma.RequestForQuotationItemCreateManyInput =>
        productData !== null
    );

  await db.requestForQuotationItem.createMany({
    data: itemsData,
  });

  return newRfqVersion;
}

export async function updateCurrentRfqVersion(
  currentRfqVersion: RFQType,
  rfqData: z.infer<typeof schema>,
  company: CompanyType
) {
  const {
    externalId,
    title,
    privateRequest,
    currency,
    endDate,
    contactPerson,
    email,
    phone,
    description,
    deliveryAddress,
    deliveryTerms,
    paymentTerms,
    items,
  } = rfqData;

  const itemsData = items.map((item, index) => {
    const existingRfqItem = currentRfqVersion.items.find(
      (existingProduct) => existingProduct.id === item.id
    );
    if (!existingRfqItem) {
      throw new Error(`Item not found - ${item.id}`);
    }

    return {
      versionId: existingRfqItem.versionId,
      id: existingRfqItem.id,
      lineNumber: index++,
      externalId: item.externalId,
      productName: item.productName,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      deliveryDate: item.deliveryDate,
      comment: item.comment,
    };
  });

  const [updatedRfq, _] = await db.$transaction([
    db.requestForQuotation.update({
      where: {
        versionId: currentRfqVersion.versionId,
      },
      data: {
        id: currentRfqVersion.id,
        number: currentRfqVersion.number,
        externalId,
        companyId: company.id,
        userId: company.users[0].userId,
        title,
        privateRequest,
        currency,
        endDate: endDate,
        contactPerson,
        email,
        phone,
        description,
        deliveryAddress,
        deliveryTerms,
        paymentTerms,
      },
    }),
    ...itemsData.map((itemData) =>
      db.requestForQuotationItem.update({
        where: {
          versionId: itemData.versionId,
        },
        data: itemData,
      })
    ),
  ]);

  return updatedRfq;
}
