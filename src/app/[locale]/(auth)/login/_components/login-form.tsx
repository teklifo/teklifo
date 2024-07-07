"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import EmailLoginForm from "./email-login-form";
import CredentialsLoginForm from "./credentials-login-form";

type LoginVariants = "email" | "credentials";

const LoginForm = () => {
  const t = useTranslations("Login");

  const [loginVariant, setLoginVariant] = useState<LoginVariants>("email");

  return loginVariant === "email" ? (
    <>
      <EmailLoginForm />
      <div className="flex justify-center items-center">
        <Button variant="link" onClick={() => setLoginVariant("credentials")}>
          {t("loginWithCredentials")}
        </Button>
      </div>
    </>
  ) : (
    <>
      <CredentialsLoginForm />
      <div className="flex justify-center items-center">
        <Button variant="link" onClick={() => setLoginVariant("email")}>
          {t("loginWithEmail")}
        </Button>
      </div>
    </>
  );
};

export default LoginForm;
