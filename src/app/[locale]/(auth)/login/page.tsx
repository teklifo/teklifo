import { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import Logo from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./_components/login-form";
import LoginWithPasswordForm from "./_components/login-with-password-form";

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

const Login = () => {
  const t = useTranslations("Login");

  return (
    <div className="flex flex-col h-screen p-8 md:flex-row">
      <div className="absolute top-0 inset-x-0 z-50 flex h-16 items-center px-2.5 md:px-20">
        <Logo />
      </div>
      <div className="w-full flex justify-center items-center">
        <div className="max-w-sm space-y-4 mt-20 md:mt-0">
          <h3 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h3>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
          <Tabs defaultValue="emailProvider">
            <TabsList className="w-full">
              <TabsTrigger
                className="w-full"
                value="emailProvider"
                data-test="email-provider-trigger"
              >
                {t("emailProvider")}
              </TabsTrigger>
              <TabsTrigger
                className="w-full"
                value="credentialsProvider"
                data-test="credentials-provider-trigger"
              >
                {t("credentialsProvider")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="emailProvider" className="mt-4">
              <LoginForm />
            </TabsContent>
            <TabsContent value="credentialsProvider" className="mt-4">
              <LoginWithPasswordForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="hidden w-full bg-muted rounded-2xl h-full items-center justify-center px-8 lg:flex lg:flex-col lg:space-y-12">
        <Image
          src="/illustrations/login.svg"
          alt="Login"
          priority
          width="600"
          height="600"
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
