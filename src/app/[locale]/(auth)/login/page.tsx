import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "./_components/login-form";
import ThemedImage from "@/components/client-image";
import Logo from "@/components/logo";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("loginTitle"),
    description: t("loginDescription"),
  };
};

const Login = async () => {
  const t = await getTranslations("Login");

  return (
    <div className="flex flex-col h-screen p-8 md:flex-row">
      <div className="absolute top-0 inset-x-0 z-50 flex h-16 items-center px-2.5 md:px-20">
        <Logo />
      </div>
      <div className="w-full flex justify-center items-center">
        <div className="max-w-sm mt-20 md:mt-0">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("title")}
            </h3>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="mt-4">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="hidden w-full bg-muted rounded-2xl h-full items-center justify-center px-8 lg:flex lg:flex-col lg:space-y-12">
        <ThemedImage
          src="/illustrations/light/login.svg"
          alt="Login"
          priority
          width="400"
          height="400"
        />
        <div className="max-w-2xl space-y-4 text-center">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
            {t("slogan")}
          </h1>
          <h4 className="text-xl text-muted-foreground">
            {t("sloganDescription")}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Login;
