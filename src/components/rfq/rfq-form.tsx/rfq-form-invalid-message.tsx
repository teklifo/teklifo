import { useTranslations } from "next-intl";
import * as z from "zod";
import { FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { getRFQSchema } from "@/lib/schemas";

const RFQFormInvalidMessage = () => {
  const t = useTranslations("RFQForm");

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  const formIsInvalid = Object.keys(form.formState.errors).length > 0;

  return formIsInvalid && <FormMessage>{t("invalidForm")}</FormMessage>;
};

export default RFQFormInvalidMessage;
