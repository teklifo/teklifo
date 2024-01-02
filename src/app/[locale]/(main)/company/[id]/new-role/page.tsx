import { useTranslations } from "next-intl";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import EditRole from "@/components/roles/edit-role";

type Props = {
  params: { locale: string; id: string };
};

const NewRole = ({ params: { id } }: Props) => {
  const t = useTranslations("Role");

  return (
    <MaxWidthWrapper className="my-8">
      <div className="space-y-2 mb-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("newRoleTitle")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("newRoleSubtitle")}</p>
      </div>
      <EditRole companyId={id} />
    </MaxWidthWrapper>
  );
};

export default NewRole;
