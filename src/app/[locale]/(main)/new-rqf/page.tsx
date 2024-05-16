import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { FileOutput } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import RFQForm from "@/components/rfq/rqf-form";
import getCurrentCompany from "@/app/actions/get-current-company";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("newRFQTitle"),
    description: t("newRFQDescription"),
  };
};

const NewRFQ = async () => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const t = await getTranslations("RFQForm");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2 mb-8">
        <div className="flex flex-row items-center space-x-2">
          <div>
            <FileOutput className="w-10 h-10" />
          </div>
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("newTitle")}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{t("newSubtitle")}</p>
      </div>
      <RFQForm />
    </MaxWidthWrapper>
  );
};

export default NewRFQ;
