import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ChevronLeft, FileInput } from "lucide-react";

type RFQLinkProps = {
  id: string;
};

const RFQLink = ({ id }: RFQLinkProps) => {
  const t = useTranslations("QuotationsCompare");

  return (
    <Link
      href={`/rfq/${id}`}
      className="leading-7 [&:not(:first-child)]:mt-6 font-semibold flex items-center space-x-2 hover:underline"
    >
      <ChevronLeft />
      <span>{t("backToRFQ")}</span>
    </Link>
  );
};

export default RFQLink;
