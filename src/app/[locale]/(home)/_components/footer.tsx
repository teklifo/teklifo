import { getTranslations } from "next-intl/server";

const Footer = async () => {
  const t = await getTranslations("Home");

  return (
    <div className="my-20">
      <p className="text-center text-sm text-muted-foreground">{t("footer")}</p>
    </div>
  );
};

export default Footer;
