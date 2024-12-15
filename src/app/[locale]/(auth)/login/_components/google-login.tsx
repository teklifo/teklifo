"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const GoogleLogin = () => {
  const t = useTranslations("Login");

  const loginWithGoogle = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard",
      redirect: true,
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={loginWithGoogle}
      className="w-full space-x-4"
    >
      <div>
        <Image
          src="/icons/google.svg"
          alt="Google"
          priority
          width={16}
          height={16}
        />
      </div>
      <span>{t("loginWithGoogle")}</span>
    </Button>
  );
};

export default GoogleLogin;
