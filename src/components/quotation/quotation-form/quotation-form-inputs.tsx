import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getQuotationSchema } from "@/lib/schemas";

const QuotationFormInputs = () => {
  const t = useTranslations("Quotation");

  const st = useTranslations("Schemas.quotationSchema");
  const formSchema = getQuotationSchema(st);
  const form = useFormContext<z.infer<typeof formSchema>>();

  return (
    <div className="my-4 px-2">
      <FormField
        control={form.control}
        name="vatIncluded"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="text-sm font-normal">
              {t("vatIncluded")}
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default QuotationFormInputs;
