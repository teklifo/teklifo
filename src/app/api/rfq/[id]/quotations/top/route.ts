import { NextRequest, NextResponse } from "next/server";
import { getTopQuotationItemsPerRFQ } from "@prisma/client/sql";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import db from "@/lib/db";
import { getTranslationsFromHeader, getErrorResponse } from "@/lib/api-utils";

type Props = {
  params: { id: string };
};

export async function GET(request: NextRequest, { params: { id } }: Props) {
  const { t } = await getTranslationsFromHeader(request.headers);
  const company = await getCurrentCompany();
  if (!company) {
    return getErrorResponse(t("invalidCompanyId"), 404);
  }

  const rfq = await db.requestForQuotation.findFirst({
    where: {
      id: id ?? "",
      latestVersion: true,
    },
  });

  if (!rfq) {
    return getErrorResponse(t("invalidRFQId"), 404);
  }

  if (rfq.companyId !== company.id) {
    return getErrorResponse(t("notAllowed"), 401);
  }

  const isAdmin = await isCompanyAdmin(company.id);
  if (!isAdmin) {
    return getErrorResponse(t("notAllowed"), 401);
  }

  const topQuotations = await db.$queryRawTyped(getTopQuotationItemsPerRFQ(id));

  return NextResponse.json(topQuotations);
}
