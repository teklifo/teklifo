import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getRFQSchema } from "@/lib/schemas";
import { getTranslationsFromHeader } from "@/lib/utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    const rfq = await db.requestForQuotation.findUnique({
      where: { id },
      include: {
        company: true,
        products: {
          include: {
            product: true,
          },
        },
        participants: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRFQId") }],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(rfq);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params: { id } }: Props) {
  const { t, locale } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getCurrentCompany();
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Update RFQ
    const body = await request.json();

    const st = await getTranslations({
      locale,
      namespace: "Schemas.rfqSchema",
    });
    const test = getRFQSchema(st).safeParse(body);
    if (!test.success) {
      return NextResponse.json(
        {
          message: t("invalidRequest"),
          errors: test.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      publicRequest,
      currency,
      startDate,
      endDate,
      description,
      deliveryAddress,
      deliveryTerms,
      paymentTerms,
      products,
    } = test.data;

    const rfq = await db.requestForQuotation.findUnique({
      where: {
        id: id ?? "",
      },
    });

    if (!rfq) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRFQId") }],
        },
        { status: 404 }
      );
    }

    if (rfq.companyId !== company.id) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    const updatedRfq = await db.requestForQuotation.update({
      where: {
        id,
      },
      data: {
        companyId: company.id,
        userId: company.users.length > 0 ? company.users[0].userId : null,
        publicRequest,
        currency,
        startDate,
        endDate,
        description,
        deliveryAddress,
        deliveryTerms,
        paymentTerms,
      },
      include: {
        products: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    const rfqProducts = await Promise.all(
      products.map(async (product) => {
        return await db.requestForQuotationProducts.upsert({
          where: {
            id: product.id ?? "",
          },
          create: {
            requestForQuotationId: updatedRfq.id,
            productId: product.productId,
            externalId: product.externalId,
            price: product.price,
            quantity: product.quantity,
            deliveryDate: product.deliveryDate,
            comment: product.comment,
          },
          update: {
            productId: product.productId,
            externalId: product.externalId,
            price: product.price,
            quantity: product.quantity,
            deliveryDate: product.deliveryDate,
            comment: product.comment,
          },
        });
      })
    );

    await db.requestForQuotationProducts.deleteMany({
      where: {
        AND: [
          {
            requestForQuotationId: updatedRfq.id,
          },
          {
            id: {
              notIn: rfqProducts.map((product) => product.id),
            },
          },
        ],
      },
    });

    const updatedRfqWithProducts = await db.requestForQuotation.findUnique({
      where: {
        id,
      },
      include: {
        products: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRfqWithProducts);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);

  try {
    // Find company
    const company = await getCurrentCompany();
    if (!company) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidCompanyId") }],
        },
        { status: 404 }
      );
    }

    const isAdmin = await isCompanyAdmin(company.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    const rfq = await db.requestForQuotation.findUnique({
      where: { id },
      include: {
        company: true,
        products: {
          include: {
            product: true,
          },
        },
        participants: true,
      },
    });

    // RFQ not found
    if (!rfq) {
      return NextResponse.json(
        {
          errors: [{ message: t("invalidRFQId") }],
        },
        { status: 404 }
      );
    }

    if (rfq.companyId !== company.id) {
      return NextResponse.json(
        {
          errors: [{ message: t("notAllowed") }],
        },
        { status: 401 }
      );
    }

    // Delete RFQ
    await db.requestForQuotation.delete({
      where: {
        id: rfq.id,
      },
    });

    return NextResponse.json({ message: t("rfqDeleted") });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { errors: [{ message: t("serverError") }] },
      { status: 500 }
    );
  }
}
