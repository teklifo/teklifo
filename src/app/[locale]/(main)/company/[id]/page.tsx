import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { CircleHelp, Pencil } from "lucide-react";
import { Link } from "@/navigation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import DeleteCompany from "./_components/delete-company";

type CompanyType = Prisma.CompanyGetPayload<{
  include: { users: true };
}>;

type Props = {
  params: { locale: string; id: string };
};

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const company = await getCompany(id);
  if (!company)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  const localizedProperties = getLocalizedProperties(company, locale);

  return {
    title: `${company.name} | ${t("projectName")}`,
    description: localizedProperties.description,
  };
};

const getCompany = async (id: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<CompanyType>(`/api/company/${id}`, {
      headers: {
        "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
        Cookie: cookie,
      },
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
};

const getLocalizedProperties = (company: CompanyType, locale: string) => {
  switch (locale) {
    case "ru":
      return {
        description: company.descriptionRu
          ? company.descriptionRu
          : company.description,
        slogan: company.sloganRu ? company.sloganRu : company.slogan,
      };
    case "en":
    default:
      return {
        description: company.description,
        slogan: company.slogan,
      };
  }
};

const Company = async ({ params: { locale, id } }: Props) => {
  const t = await getTranslations("Company");

  const currentCompany = await getCurrentCompany();

  const company = await getCompany(id);
  if (!company) return notFound();

  const canEditCompany =
    currentCompany?.id === id && (await isCompanyAdmin(id));

  let { description, slogan } = getLocalizedProperties(company, locale);

  return (
    <MaxWidthWrapper className="my-8 space-y-4">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {company.name}
          </h1>
          {slogan && <p className="text-lg text-muted-foreground">{slogan}</p>}
          <p className="text-lg text-muted-foreground">{`${t("tin")}: ${
            company.tin
          }`}</p>
        </div>
        {canEditCompany && (
          <div className="flex space-x-2">
            <Link
              href={`/edit-company`}
              className={cn(
                "space-x-2",
                buttonVariants({ variant: "outline" })
              )}
              data-test="edit-company"
            >
              <Pencil className="h-4 w-4" />
              <span>{t("edit")}</span>
            </Link>
            <DeleteCompany company={company} />
          </div>
        )}
      </div>
      {description ? (
        <div className="whitespace-pre-line">{description}</div>
      ) : (
        <div className="mb-8 mt-24 flex flex-col justify-center items-center space-y-4 text-center">
          <CircleHelp className="w-48 h-48 text-foreground" />
          <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {t("noDescription")}
          </h2>
        </div>
      )}
    </MaxWidthWrapper>
  );
};

export default Company;
