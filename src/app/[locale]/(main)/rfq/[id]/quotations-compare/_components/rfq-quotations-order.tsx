"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type RFQQuotationOrderProps = {
  id: string;
  defaultValue?: string;
};

const RFQQuotationOrder = ({ id, defaultValue }: RFQQuotationOrderProps) => {
  const t = useTranslations("QuotationsCompare");

  const router = useRouter();

  const onValueChange = (value: string) => {
    router.push(`/rfq/${id}/quotations-compare?order=${value}&page=1`);
    router.refresh();
  };

  return (
    <Select
      onValueChange={onValueChange}
      defaultValue={defaultValue ?? "amountAsc"}
    >
      <SelectTrigger className="max-w-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="amountAsc">{t("orderByAmountAsc")}</SelectItem>
          <SelectItem value="amountDesc">{t("orderByAmountDesc")}</SelectItem>
          <SelectItem value="dateAsc">{t("orderByDateAsc")}</SelectItem>
          <SelectItem value="dateDesc">{t("orderByDateDesc")}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default RFQQuotationOrder;
