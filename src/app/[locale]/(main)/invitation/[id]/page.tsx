import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import AcceptInvitation from "@/components/invitation/accept-invitation";
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
    console.log(error);
    return undefined;
  }
};

const Invitation = async ({ params: { id } }: Props) => {
  const invitation = await getInvitation(id);

  const t = await getTranslations("Invitation");

  return (
    <MaxWidthWrapper className="mt-8">
      {invitation ? (
        <AcceptInvitation
          id={id}
          companyName={invitation.company.name}
          companyId={invitation.companyId}
        />
      ) : (
        <span>No!</span>
      )}
    </MaxWidthWrapper>
  );
};

export default Invitation;
