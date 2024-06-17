import Image from "next/image";
import { useTranslations } from "next-intl";

const NotFound = () => {
  const t = useTranslations("NotFound");

  return (
    <div
      className="min-h-[80vh] flex flex-col justify-center items-center"
      data-test="not-found"
    >
      <div className="text-center space-y-2 mb-24">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl">
          {t("notFoundTitle")}
        </h1>
        <p className="text-xl text-muted-foreground">{t("notFoundSubitle")}</p>
      </div>
      <Image
        src="/illustrations/404.svg"
        alt="Not found"
        priority
        width={400}
        height={400}
      />
    </div>
  );
};

export default NotFound;
