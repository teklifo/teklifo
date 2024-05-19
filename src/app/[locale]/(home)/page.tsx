import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const Home = async () => {
  const t = await getTranslations("Home");

  return (
    <div className="relative h-[50vh] w-full flex flex-col justify-center items-center text-center space-y-4">
      <div className="-z-10 absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <h1 className="text-3xl font-bold leading-tight tracking-tighter max-w-4xl md:text-5xl lg:leading-[1.1]">
        {t("title")}
      </h1>
      <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      <Link
        href={`/dashboard`}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "space-x-2"
        )}
      >
        <span>{t("getStarted")}</span>
      </Link>
    </div>
  );
};

export default Home;
