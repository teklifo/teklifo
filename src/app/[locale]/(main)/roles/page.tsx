import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { CompanyRole as RoleType } from "@prisma/client";
import { MoreHorizontal, Plus, Pencil } from "lucide-react";
import { Link } from "@/navigation";
import DeleteRole from "./_components/delete-role";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import PaginationBar from "@/components/ui/pagination-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: RoleType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("rolesTitle"),
    description: t("rolesDescription"),
  };
};

const getCompanyRoles = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/role?page=${page}&limit=10`,
      {
        headers: {
          "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
          Cookie: cookie,
        },
        next: { revalidate: 0 },
      }
    );
  } catch (error) {
    return undefined;
  }
};

const Roles = async ({ searchParams: { page } }: Props) => {
  const company = await getCurrentCompany();
  if (!company) return notFound();

  const isAdmin = await isCompanyAdmin(company.id);

  const data = await getCompanyRoles(company.id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("Role");

  return (
    <MaxWidthWrapper className="mt-8 mb-16">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        {isAdmin && (
          <Link
            href={`/new-role`}
            className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
          >
            <Plus />
            <span>{t("new")}</span>
          </Link>
        )}
      </div>
      <div className="mt-4">
        {result.length > 0 && (
          <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2">
            {result.map((role) => (
              <Card
                key={role.id}
                className="h-full w-full"
                data-test="role-card"
              >
                <CardHeader>
                  <div className="flex flex-row justify-between">
                    <CardTitle>{role.name}</CardTitle>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t("openMenu")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="flex flex-col"
                        >
                          <Link
                            href={`/edit-role/${role.id}`}
                            className={buttonVariants({ variant: "ghost" })}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>{t("edit")}</span>
                          </Link>
                          <DeleteRole companyId={company.id} roleId={role.id} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <CardDescription>{`${t("id")}: ${role.id}`}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        <PaginationBar href={`/roles?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default Roles;
