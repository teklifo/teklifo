import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { BarChart, Handshake, Pencil, Sparkles } from "lucide-react";
import { Link } from "@/navigation";
import { Prisma } from "@prisma/client";
import DeleteRFQ from "./delete-rfq";
import ShareRFQ from "./share-rfq";
import StartQuotation from "./start-quotation";
import ConfirmParticipation from "./confirm-participation";
import { Button, buttonVariants } from "@/components/ui/button";
import CompanyRequired from "@/components/company-required";
import AuthRequired from "@/components/auth-required";
import getCurrentCompany from "@/app/actions/get-current-company";
import getCurrentUser from "@/app/actions/get-current-user";
import { cn } from "@/lib/utils";
import { RequestForQuotationType } from "@/types";

type CompanyWithUsers = Prisma.CompanyGetPayload<{
  include: {
    users: {
      include: {
        companyRole: true;
      };
    };
  };
}>;

type RFQActionsProps = {
  rfq: RequestForQuotationType;
};

const RFQActions = async ({ rfq }: RFQActionsProps) => {
  const currentCompany = await getCurrentCompany();
  const companyIsRequester = rfq.companyId === currentCompany?.id;

  return (
    <div className="flex flex-col space-y-2">
      {companyIsRequester ? (
        <RequestorActions rfq={rfq} currentCompany={currentCompany} />
      ) : (
        <GuestActions rfq={rfq} currentCompany={currentCompany} />
      )}
    </div>
  );
};

type RequestorActionsProps = {
  rfq: RequestForQuotationType;
  currentCompany: CompanyWithUsers | null;
};

const RequestorActions = ({ rfq, currentCompany }: RequestorActionsProps) => {
  const t = useTranslations("RFQ");

  const isAdmin =
    currentCompany !== null
      ? currentCompany.users[0].companyRole.default
      : false;

  const completed = new Date(rfq.endDate) < new Date();

  return (
    <>
      {isAdmin && (
        <>
          <div className="relative inline-flex group">
            <div className="absolute transitiona-all duration-1000 opacity-70 -inset-px bg-gradient-to-r from-[#44BCFF] to-[#FF44EC] rounded-xl blur-sm group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200"></div>
            <Link
              href={`/rfq/${rfq.id}/ai-analysis`}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "relative w-full text-center whitespace-normal h-auto space-x-2 lg:w-full bg-background hover:!bg-background"
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span>{t("aiAnalysis")}</span>
            </Link>
          </div>
          <Link
            href={`/rfq/${rfq.id}/quotations-compare`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-center whitespace-normal h-auto space-x-2 lg:w-full"
            )}
          >
            <BarChart className="h-4 w-4" />
            <span>{t("compareQuotations")}</span>
          </Link>
        </>
      )}
      {!completed && (
        <>
          <ShareRFQ />
          {isAdmin && (
            <>
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
        </>
      )}
    </>
  );
};

type GuestActionsProps = {
  rfq: RequestForQuotationType;
  currentCompany: CompanyWithUsers | null;
};

const GuestActions = async ({ rfq, currentCompany }: GuestActionsProps) => {
  const user = await getCurrentUser();

  const completed = new Date(rfq.endDate) < new Date();

  const companyIsParticipant =
    rfq.participants.find(
      (participant) => participant.companyId === currentCompany?.id
    ) !== undefined;

  return (
    !completed &&
    (currentCompany ? (
      companyIsParticipant ? (
        <StartQuotation rfq={rfq} company={currentCompany} />
      ) : (
        <ConfirmParticipation id={rfq.id} />
      )
    ) : user ? (
      <CompanyRequired>
        <ConfirmParticipationTrigger />
      </CompanyRequired>
    ) : (
      <AuthRequired>
        <ConfirmParticipationTrigger />
      </AuthRequired>
    ))
  );
};

const ConfirmParticipationTrigger = () => {
  const t = useTranslations("RFQ");

  return (
    <Button className="text-center whitespace-normal h-auto space-x-2 lg:w-full">
      <Handshake className="mr-2 h-4 w-4" />
      <span>{t("confirmParticipation")}</span>
    </Button>
  );
};

export default RFQActions;
