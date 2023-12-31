import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import Pagination from "@/components/ui/pagination";
import MemberForm from "@/components/members/member-form";
import InvitationForm from "@/components/members/invitation-form";
import DeleteMember from "@/components/members/delete-member";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import request from "@/lib/request";
import { PaginationType } from "@/types";

type MemberType = Prisma.CompanyMembersGetPayload<{
  include: { user: true; companyRole: true };
}>;

type Props = {
  params: { locale: string; id: string };
  searchParams: {
    page?: number;
  };
};

type PaginatedData = {
  result: MemberType[];
  pagination: PaginationType;
};

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("membersTitle"),
    description: t("membersDescription"),
  };
};

const getCompanyMembers = async (companyId: string, page: number) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<PaginatedData>(
      `/api/company/${companyId}/member?page=${page}&limit=10`,
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

const Members = async ({ params: { id }, searchParams: { page } }: Props) => {
  const data = await getCompanyMembers(id, page ?? 1);
  if (!data) return notFound();

  const { result, pagination } = data;

  const t = await getTranslations("Member");

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <InvitationForm companyId={id} />
      </div>
      <div className="mt-4">
        {result.length > 0 && (
          <div className="grid grid-flow-row auto-rows-max place-items-center grid-cols-1 gap-4 pt-4 md:place-items-start md:grid-cols-2 lg:grid-cols-3">
            {result.map((member) => (
              <Card key={member.userId} className="h-full w-full">
                <CardHeader>
                  <div className="flex flex-row justify-between">
                    <CardTitle className="text-xl truncate">
                      {member.user.name || member.user.email}
                    </CardTitle>
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
                        <MemberForm companyId={id} member={member} />
                        <DeleteMember companyId={id} memberId={member.userId} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{`${t("role")}: ${
                    member.companyRole.name
                  }`}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        <Pagination href={`/${id}/members?page=`} pagination={pagination} />
        <div />
      </div>
    </MaxWidthWrapper>
  );
};

export default Members;
