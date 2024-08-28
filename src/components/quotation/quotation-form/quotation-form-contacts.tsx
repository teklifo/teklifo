import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import PhoneNumberInput from "react-phone-number-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getQuotationSchema } from "@/lib/schemas";

const QuotationFormContatcs = () => {
  const t = useTranslations("Quotation");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  return (
    <div className="mt-4 p-2 space-y-4">
      {/* Contact person*/}
      <FormField
        control={form.control}
        name="contactPerson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("contactPerson")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" className="max-w-md" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Email*/}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("email")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" className="max-w-md" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Phone*/}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("phone")}</FormLabel>
            <FormControl>
              <PhoneNumberInput
                {...field}
                inputComponent={Input}
                international
                autoComplete="off"
                className="max-w-md"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default QuotationFormContatcs;
