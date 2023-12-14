import { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import LoginForm from "@/components/login-form";

type Props = {
  params: { locale: string };
};

const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
};

const Login = () => {
  const t = useTranslations("Login");

  return (
    <div className="flex flex-col h-screen p-8 md:flex-row">
      <div className="w-full flex justify-center items-center">
        <div className="max-w-sm space-y-8">
          <h3 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h3>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          <LoginForm />
        </div>
      </div>
      <div className="hidden w-full bg-muted rounded-2xl h-full items-center justify-center lg:flex lg:flex-col lg:space-y-12">
        <Image
          src="/illustrations/login.svg"
          alt="Login"
          priority
          width="600"
          height="600"
        />
        <div className="space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t("slogan")}
          </h1>
          <h4 className="text-lg tracking-tight text-muted-foreground max-w-md">
            {t("sloganDescription")}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Login;
