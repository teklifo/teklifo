import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import AcceptInvitation from "./_components/accept-invitation";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import request from "@/lib/request";

type Props = {
  params: { locale: string; id: string };
};

type MemberType = Prisma.InvitationGetPayload<{
  include: { company: true };
}>;

export const generateMetadata = async ({
  params: { locale },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("invitationTitle"),
    description: t("invitationDescription"),
  };
};

const getInvitation = async (id: string) => {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<MemberType>(`/api/invitation/${id}`, {
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

const Invitation = async ({ params: { id } }: Props) => {
  const invitation = await getInvitation(id);
  if (!invitation) return notFound();

  const t = await getTranslations("Invitation");

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-12 lg:flex-row lg:space-y-0">
        <div className="w-full flex justify-center items-center text-center">
          <div className="max-w-lg space-y-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {t("title", {
                companyName: invitation.company.name,
              })}
            </h1>
            <p className="text-lg text-muted-foreground ">
              {t("subtitle", {
                companyName: invitation.company.name,
              })}
            </p>
            <AcceptInvitation
              id={id}
              companyName={invitation.company.name}
              companyId={invitation.companyId}
            />
          </div>
        </div>
        <div className="w-full h-auto flex items-center justify-center lg:h-full lg:flex-col lg:space-y-12">
          <Image
            src="/illustrations/invitation.svg"
            alt="Invitation"
            priority
            width={600}
            height={600}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default Invitation;
