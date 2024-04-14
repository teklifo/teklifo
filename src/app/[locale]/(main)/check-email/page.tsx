import { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { buttonVariants } from "@/components/ui/button";
import MaxWidthWrapper from "@/components/max-width-wrapper";

type Props = {
  params: { locale: string };
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("checkEmailTitle"),
    description: t("checkEmailDescription"),
  };
};

const CheckEmail = () => {
  const t = useTranslations("CheckEmail");

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-12 lg:flex-row lg:space-y-0">
        <div className="w-full flex justify-center items-center text-center">
          <div className="max-w-md space-y-8">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
            <Link href="/" className={buttonVariants({ variant: "default" })}>
              {t("home")}
            </Link>
          </div>
        </div>
        <div className="w-full h-auto flex items-center justify-center lg:h-full lg:flex-col lg:space-y-12">
          <Image
            src="/illustrations/check-email.svg"
            alt="Check email"
            priority
            width={600}
            height={600}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default CheckEmail;
