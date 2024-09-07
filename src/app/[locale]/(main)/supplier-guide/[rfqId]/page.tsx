import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import GuideStep from "./_components/guide-steps";
import ExternalLink from "./_components/external-link";
import ConfirmParticipation from "./_components/confirm-participation";
import ThemedImage from "@/components/themed-image";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import getCurrentUser from "@/app/actions/get-current-user";
import getCurrentCompany from "@/app/actions/get-current-company";
import getRFQPreview from "@/app/actions/get-rfq-preview";
import { cn } from "@/lib/utils";

type Props = {
  params: { locale: string; rfqId: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("supplierGuideTitle"),
    description: t("supplierGuideDescription"),
  };
};

const SupplierGuide = async ({ params: { rfqId } }: Props) => {
  const rfqPreview = await getRFQPreview(rfqId);
  if (!rfqPreview) {
    return notFound();
  }

  const company = await getCurrentCompany();

  const companyIsRequester = rfqPreview.company.id === company?.id;

  const companyIsParticipant =
    rfqPreview.participants.find(
      (participant) => participant.companyId === company?.id
    ) !== undefined;

  if (
    companyIsRequester ||
    companyIsParticipant ||
    !rfqPreview.privateRequest
  ) {
    redirect(`/rfq/${rfqId}`);
  }

  const user = await getCurrentUser();

  const t = await getTranslations("SupplierGuide");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="flex flex-col items-center justify-center space-y-12">
        <div className="flex flex-col justify-center items-center w-full space-y-4">
          <h1 className="text-center max-w-xl text-4xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-center max-w-2xl text-lg text-muted-foreground ">
            {company ? t("subtitleAlt") : t("subtitle")}
          </p>
        </div>
        <div
          className={cn(
            "flex flex-col justify-center items-center space-y-8 ",
            company ? "" : " lg:space-y-0 lg:flex-row"
          )}
        >
          <div className="w-full flex justify-center items-center text-center">
            <div className="max-w-md space-y-8">
              {!company && (
                <>
                  <GuideStep stepNumber={1} stepIsDone={user ? true : false}>
                    <p>
                      {t.rich("stepOne", {
                        link: (chunk) => (
                          <ExternalLink href="/auth">{chunk}</ExternalLink>
                        ),
                      })}
                    </p>
                  </GuideStep>
                  <GuideStep stepNumber={2} stepIsDone={company ? true : false}>
                    <p>
                      {t.rich("stepTwo", {
                        existing: (chunk) => (
                          <ExternalLink href="/company">{chunk}</ExternalLink>
                        ),
                        new: (chunk) => (
                          <ExternalLink href="/new-company">
                            {chunk}
                          </ExternalLink>
                        ),
                      })}
                    </p>
                  </GuideStep>
                  <GuideStep stepNumber={3} stepIsDone={false}>
                    <p>{t("stepThree")}</p>
                  </GuideStep>
                </>
              )}

              <div className="flex justify-center items-center w-full">
                <ConfirmParticipation rfqId={rfqId} company={company} />
              </div>
            </div>
          </div>
          <div className="w-full h-auto flex items-center justify-center mx-4 lg:h-full lg:flex-col lg:space-y-12">
            <ThemedImage
              src="/illustrations/light/email.svg"
              alt="Supplier guide"
              priority
              width={400}
              height={400}
            />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default SupplierGuide;
