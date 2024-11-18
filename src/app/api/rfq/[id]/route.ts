import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import {
  checkRfqItemsChanged,
  createNewRfqVersion,
  updateCurrentRfqVersion,
} from "./_utils/rfq-update";
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

    // Find and check RFQ
    const currentRfqVersion = await db.requestForQuotation.findFirst({
      where: {
        id: id ?? "",
        latestVersion: true,
      },
      include: {
        items: true,
        participants: true,
      },
    });

    if (!currentRfqVersion) {
      return getErrorResponse(t("invalidRFQId"), 404);
    }

    if (currentRfqVersion.companyId !== company.id) {
      return getErrorResponse(t("notAllowed"), 401);
    }

    if (currentRfqVersion.endDate < new Date()) {
      return getErrorResponse(t("rfqIsCompleted"), 400);
    }

    let rfqItemsChanged = checkRfqItemsChanged(currentRfqVersion, test.data);

    let rfq = null;
    if (rfqItemsChanged) {
      rfq = await createNewRfqVersion(currentRfqVersion, test.data, company);
    } else {
      rfq = await updateCurrentRfqVersion(
        currentRfqVersion,
        test.data,
        company
      );
    }

    const newRfqVersionWithProducts = await db.requestForQuotation.findUnique({
      where: {
        versionId: rfq.versionId,
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
