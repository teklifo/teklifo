import { getTranslations } from "next-intl/server";
import { BarChart, Pencil } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { Link } from "@/navigation";
import DeleteRFQ from "./delete-rfq";
import ShareRFQ from "./share-rfq";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany from "@/app/actions/get-current-company";
import { cn } from "@/lib/utils";
import StartQuotation from "./start-quotation";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
    items: {
      include: {
        product: true;
      };
    };
    _count: {
      select: {
        quotations: true;
      };
    };
    participants: true;
  };
}>;

type RFQActions = {
  rfq: RequestForQuotationType;
};

const RFQActions = async ({ rfq }: RFQActions) => {
  const t = await getTranslations("RFQ");

  const company = await getCurrentCompany();

  const isAdmin =
    company !== null ? company.users[0].companyRole.default : false;

  const companyIsRequester = rfq.companyId === company?.id;

  const companyIsParticipant =
    rfq.participants.find(
      (participant) => participant.companyId === company?.id
    ) !== undefined ||
    (!rfq.privateRequest && !companyIsRequester);

  const completed = new Date(rfq.endDate) < new Date();

  return (
    <div className="flex flex-col space-y-2">
      {company && companyIsParticipant && !completed && (
        <StartQuotation rfq={rfq} company={company} />
      )}
      {companyIsRequester && isAdmin && !completed && (
        <>
          <Link
            href={`/rfq/${rfq.id}/quotations-compare`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "text-center whitespace-normal h-auto space-x-2 lg:w-full"
            )}
          >
            <BarChart className="h-4 w-4" />
            <span>{t("compareQuotations")}</span>
          </Link>
          <Link
            href={`/edit-rfq/${rfq.id}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-center whitespace-normal h-auto space-x-2 lg:w-full"
            )}
          >
            <Pencil className="h-4 w-4" />
            <span>{t("edit")}</span>
          </Link>
          <DeleteRFQ rfq={rfq} />
        </>
      )}
      {companyIsRequester && <ShareRFQ />}
    </div>
  );
};

export default RFQActions;
