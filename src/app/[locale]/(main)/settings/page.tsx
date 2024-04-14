import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import SettingsForm from "./_components/settings-form";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import getCurrentUser from "@/app/actions/get-current-user";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const user = await getCurrentUser();
  if (!user)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  return {
    title: t("settingsTitle", { username: user.name || user.email }),
    description: t("settingsDescription"),
  };
};

const Settings = async () => {
  const user = await getCurrentUser();
  if (!user) return notFound();

  const t = await getTranslations("Settings");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {t("updateTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("updateSubtitle")}</p>
      </div>
      <div className="mt-4">
        <SettingsForm user={user} />
      </div>
    </MaxWidthWrapper>
  );
};

export default Settings;
