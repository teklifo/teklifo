import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import getCurrentCompany from "@/app/actions/get-current-company";
import WelcomeScreen from "../_components/welcome-screen";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("dashboardTitle"),
    description: t("dashboardDescription"),
  };
};

const Dashboard = async () => {
  const company = await getCurrentCompany();

  return <div>{!company ? <WelcomeScreen /> : null}</div>;
};

export default Dashboard;
