import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
};

const Home = () => {
  return <div>Home</div>;
};

export default Home;
