import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { getRFQSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type RFQProductsProps = {
  index: number;
};

const RFQProducts = ({ index }: RFQProductsProps) => {
  const t = useTranslations("RFQForm");

  const st = useTranslations("Schemas.roleSchema");
  const formSchema = getRFQSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  return (
    <div className="flex flex-col space-x-0 space-y-8 md:flex-row md:justify-start md:space-y-0 md:space-x-8">
      {/* Quantity */}
      <FormField
        control={form.control}
        name={`products.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("quantity")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Price */}
      <FormField
        control={form.control}
        name={`products.${index}.price`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("price")}</FormLabel>
            <FormControl>
              <Input {...field} autoComplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Delivery date */}
      <FormField
        control={form.control}
        name={`products.${index}.deliveryDate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("deliveryDate")}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>{t("pickDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RFQProducts;
