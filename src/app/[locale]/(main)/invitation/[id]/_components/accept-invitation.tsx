"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { getCookie } from "cookies-next";
import type { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import request from "@/lib/request";

type MemberType = Prisma.CompanyMembersGetPayload<{
  include: { user: true; companyRole: true };
}>;

type Props = {
  id: string;
  companyName: string;
  companyId: string;
};

const AcceptInvitation = ({ id, companyName, companyId }: Props) => {
  const t = useTranslations("Invitation");
  const router = useRouter();

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const acceptInvitation = async () => {
    setLoading(true);

    try {
      await request<MemberType>(`/api/invitation/${id}`, {
        method: "post",
        headers: {
          "Accept-Language": getCookie("NEXT_LOCALE"),
        },
        next: { revalidate: 0 },
      });

      toast({
        title: t("invitationAccepted", { companyName }),
        description: t("invitationAcceptedHint"),
      });

      router.push(`/company/${companyId}`);
      router.refresh();
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Button disabled={loading} onClick={acceptInvitation}>
      {t("accept")}
    </Button>
  );
};

export default AcceptInvitation;
