import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRFQSchema } from "@/lib/schemas";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  const company = await getCurrentCompany();

  try {
    const rfq = await db.requestForQuotation.findFirst({
      where: {
        id,
        latestVersion: true,
        OR: [
          {
            companyId: company?.id ?? "",
          },
          {
            participants: {
              some: {
                companyId: company?.id ?? "",
              },
            },
          },
          {
            privateRequest: false,
          },
        ],
      },
      include: {
        company: true,
        items: {
          include: {
            product: true,
          },
          orderBy: {
            lineNumber: "asc",
          },
        },
        _count: {
          select: {
            quotations: {
              where: {
                OR: [
                  {
                    companyId: company?.id ?? "",
                  },
                  {
                    rfq: {
                      companyId: company?.id ?? "",
                    },
                  },
                ],
              },
            },
          },
        },
        participants: {
          where: {
            companyId: company?.id,
          },
        },
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function PUT(request: NextRequest, { params: { id } }: Props) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Test request body
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.rfqSchema",
    });
    const test = getRFQSchema(st).safeParse(body);
    if (!test.success) {
      return getErrorResponse(test.error.issues, 400, t("invalidRequest"));
    }

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
    } = test.data;

    // Find and check RFQ
    const previousRfqVersion = await db.requestForQuotation.findFirst({
      where: {
        id: id ?? "",
        latestVersion: true,
      },
      include: {
        items: true,
        participants: true,
      },
    });

    if (!previousRfqVersion) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    if (previousRfqVersion.companyId !== company.id) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    if (previousRfqVersion.endDate < new Date()) {
      return getErrorResponse(t("rfqIsCompleted"), 400);
    }

    // Prev version is not latest anymore
    await db.requestForQuotation.update({
      where: {
        versionId: previousRfqVersion.versionId,
      },
      data: {
        latestVersion: false,
      },
    });

    // Create new version of RFQ
    const newRfqVersion = await db.requestForQuotation.create({
      data: {
        id: previousRfqVersion.id,
        number: previousRfqVersion.number,
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
            data: previousRfqVersion.participants.map((e) => ({
              companyId: e.companyId,
            })),
          },
        },
      },
    });

    const itemsDataUnfiltered = items.map((item, index) => {
      const existingRfqItem = previousRfqVersion.items.find(
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

    const newRfqVersionWithProducts = await db.requestForQuotation.findUnique({
      where: {
        versionId: newRfqVersion.versionId,
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newRfqVersionWithProducts);
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}

export async function DELETE(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Check company
    const company = await getCurrentCompany();
    if (!company) {
      return getErrorResponse(t("invalidCompanyId"), 404);
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    const rfq = await db.requestForQuotation.findFirst({
      where: { id, latestVersion: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        participants: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    if (rfq.companyId !== company.id) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    // Delete RFQ
    await db.requestForQuotation.deleteMany({
      where: {
        id: rfq.id,
      },
    });

    return NextResponse.json({ message: t("rfqDeleted") });
  } catch (error) {
    console.log(error);
    return getErrorResponse(t("serverError"), 500);
  }
}
