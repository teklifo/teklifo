import { useTranslations } from "next-intl";
import {
  Control,
  ControllerRenderProps,
  FieldArrayWithId,
  useFormContext,
} from "react-hook-form";
import * as z from "zod";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  FormControl,
  FormField,
  FormItem,
  useFormField,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { getRFQSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type RFQItemProps = {
  productField: FieldArrayWithId;
  index: number;
};

type CellFieldProps = {
  control: Control<any>;
  name: string;
  value?: string | number | readonly string[] | undefined;
};

type TableInputProps = {
  field: ControllerRenderProps<any, string>;
  value?: string | number | readonly string[] | undefined;
};

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <TableCell className="p-0 border-none">{children}</TableCell>;
};

const CellField = ({ control, name, value }: CellFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TableInput field={field} value={value} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

const TableInput = ({ field, value }: TableInputProps) => {
  const { error } = useFormField();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Input
            {...field}
            value={value || field.value}
            autoComplete="off"
            className={cn(
              "border rounded-none focus:outline-none focus:ring-0 focus-visible:outline-0 focus-visible:outline-offset-0  focus-visible:ring-0 focus-visible:ring-offset-0",
              error && "bg-red-300"
            )}
          />
        </TooltipTrigger>
        {error && (
          <TooltipContent side="bottom">
            <p>{error?.message}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

const RFQItem = ({ productField, index }: RFQItemProps) => {
  const t = useTranslations("RFQForm");

  const st = useTranslations("Schemas.rfqSchema");
  const formSchema = getRFQSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  const productName = form.watch(`items.${index}.productName`);

  return (
    <TableRow className="border-none">
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          {productName}
        </div>
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.quantity`} />
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.price`} />
      </Cell>
      <Cell>
        <CellField control={form.control} name={`items.${index}.comment`} />
      </Cell>
    </TableRow>
  );
};

export default RFQItem;
