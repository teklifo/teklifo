import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getRFQSchema } from "@/lib/schemas";

const RFQFormAdditional = () => {
  const t = useTranslations("RFQForm");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getRFQSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  return (
    <div className="mt-4 space-y-4">
      {/* Delivery address*/}
      <FormField
        control={form.control}
        name="deliveryAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("deliveryAddress")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Delivery terms*/}
      <FormField
        control={form.control}
        name="deliveryTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("deliveryTerms")}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Payment terms*/}
      <FormField
        control={form.control}
        name="paymentTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("paymentTerms")}</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RFQFormAdditional;
