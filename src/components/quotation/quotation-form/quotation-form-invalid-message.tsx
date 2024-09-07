import { useTranslations } from "next-intl";
import * as z from "zod";
import { FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { getQuotationSchema } from "@/lib/schemas";

const QuotationFormInvalidMessage = () => {
  const t = useTranslations("Quotation");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const formIsInvalid = Object.keys(form.formState.errors).length > 0;

  return (
    formIsInvalid && (
      <FormMessage className="px-2">{t("invalidForm")}</FormMessage>
    )
  );
};

export default QuotationFormInvalidMessage;
