import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import MaxWidthWrapper from "@/components/max-width-wrapper";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("invitationTitle"),
    description: t("invitationDescription"),
  };
};

const CompanySuggestion = async () => {
  const t = await getTranslations("CompanySuggestion");

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-12 lg:flex-row lg:space-y-0">
        <div className="w-full flex justify-center items-center text-center">
          <div className="max-w-lg space-y-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground ">{t("subtitle")}</p>
          </div>
        </div>
        <div className="w-full h-auto flex items-center justify-center lg:h-full lg:flex-col lg:space-y-12">
          <Image
            src="/illustrations/invitation.svg"
            alt="Company suggestion"
            priority
            width={600}
            height={600}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default CompanySuggestion;
