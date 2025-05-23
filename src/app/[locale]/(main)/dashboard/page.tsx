import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import getCurrentUser from "@/app/actions/get-current-user";
import WelcomeScreen from "./_components/welcome-screen";
import BetaDisclaimer from "./_components/beta-disclaimer";

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
  const t = await getTranslations("Dashboard");

  const user = await getCurrentUser();
  if (!user) return notFound();

  const userCompanies = await db.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      _count: {
        select: {
          companies: {
            where: {
              company: {
                deleted: false,
              },
            },
          },
        },
      },
    },
  });

  return (
    <div>
      {(userCompanies?._count.companies ?? 0) === 0 ? (
        <WelcomeScreen />
      ) : (
        <BetaDisclaimer />
      )}
    </div>
  );
};

export default Dashboard;
