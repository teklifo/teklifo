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
import { getRFQSchema } from "@/lib/schemas";

const RFQFormContatcs = () => {
  const t = useTranslations("RFQForm");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getRFQSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  return (
    <div className="mt-4 space-y-4">
      {/* Contact person*/}
      <FormField
        control={form.control}
        name="contactPerson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("contactPerson")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
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
              <Input {...field} autoComplete="off" />
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
                data-test="phone"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RFQFormContatcs;
