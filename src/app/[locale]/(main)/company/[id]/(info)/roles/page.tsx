import { Metadata } from "next";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { CompanyRole as RoleType } from "@prisma/client";
import { MoreHorizontal, Plus, Pencil } from "lucide-react";
import DeleteRole from "./_components/delete-role";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Pagination from "@/components/ui/pagination";
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
import request from "@/lib/request";
import { cn } from "@/lib/utils";
import { PaginationType } from "@/types";

type Props = {
  params: { locale: string; id: string };
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

const Roles = async ({ params: { id }, searchParams: { page } }: Props) => {
  const data = await getCompanyRoles(id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("Role");

  return (
    <MaxWidthWrapper className="mb-8">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link
          href={`/company/${id}/new-role`}
          className={cn(buttonVariants({ variant: "default" }), "space-x-2")}
        >
          <Plus />
          <span>{t("new")}</span>
        </Link>
      </div>
      <div className="mt-4">
        {result.length > 0 && (
          <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2">
            {result.map((role) => (
              <Card key={role.id} className="h-full w-full">
                <CardHeader>
                  <div className="flex flex-row justify-between">
                    <CardTitle>{role.name}</CardTitle>
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
                          href={`/company/${id}/edit-role/${role.id}`}
                          className={buttonVariants({ variant: "ghost" })}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>{t("edit")}</span>
                        </Link>
                        <DeleteRole companyId={id} roleId={role.id} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{`${t("id")}: ${role.id}`}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        <Pagination
          href={`/company/${id}/roles?page=`}
          pagination={pagination}
        />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default Roles;
