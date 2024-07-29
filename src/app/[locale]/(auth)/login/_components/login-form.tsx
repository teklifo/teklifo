"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import EmailLoginForm from "./email-login-form";
import CredentialsLoginForm from "./credentials-login-form";
import GoogleLogin from "./google-login";

type LoginVariants = "email" | "credentials";

const LoginForm = () => {
  const t = useTranslations("Login");

  const [loginVariant, setLoginVariant] = useState<LoginVariants>("email");

  return (
    <>
      <div className="space-y-4">
        {loginVariant === "email" ? (
          <EmailLoginForm />
        ) : (
          <CredentialsLoginForm />
        )}
      </div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("or")}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <GoogleLogin />
        <div className="flex justify-center items-center">
          {loginVariant === "email" ? (
            <Button
              variant="link"
              onClick={() => setLoginVariant("credentials")}
            >
              {t("loginWithCredentials")}
            </Button>
          ) : (
            <Button variant="link" onClick={() => setLoginVariant("email")}>
              {t("loginWithEmail")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginForm;
