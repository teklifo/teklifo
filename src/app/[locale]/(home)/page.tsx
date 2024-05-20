import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";
import { HeroHighlight, Highlight } from "./_components/hero-highlight";
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
    <HeroHighlight>
      <div className="h-[50vh] w-full px-3 flex flex-col justify-center items-center text-center space-y-8">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter max-w-4xl md:text-5xl md:leading-[1.3]">
          {t.rich("title", {
            highlight: (chunk) => (
              <Highlight className="text-black dark:text-white">
                {chunk}
              </Highlight>
            ),
          })}
        </h1>
        <p className="text-xl font-semibold text-muted-foreground">
          {t("subtitle")}
        </p>
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
    </HeroHighlight>
  );
};

export default Home;
