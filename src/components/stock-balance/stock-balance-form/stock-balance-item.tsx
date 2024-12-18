import { useTranslations } from "next-intl";
import {
  Control,
  ControllerRenderProps,
  useFormContext,
  useWatch,
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
import { getStockBalanceSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type StockBalanceItemProps = {
  index: number;
};

interface CellFieldProps extends React.ComponentPropsWithoutRef<"input"> {
  control: Control<any>;
  name: string;
}

interface TableInputProps extends React.ComponentPropsWithoutRef<"input"> {
  field: ControllerRenderProps<any, string>;
}

const Cell = ({ children }: { children: React.ReactNode }) => {
  return <TableCell className="p-0 border-none">{children}</TableCell>;
};

const CellField = ({ control, name, ...props }: CellFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TableInput field={field} {...props} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

const TableInput = ({ field, ...props }: TableInputProps) => {
  const { error } = useFormField();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Input
            {...field}
            {...props}
            value={field.value}
            autoComplete="off"
            onBlur={undefined}
            onFocus={(e) => e.target.select()}
            onWheel={(e) => e.currentTarget.blur()}
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

const StockBalanceItem = ({ index }: StockBalanceItemProps) => {
  const stockName = useWatch({ name: `balance.${index}.stockName` });

  const st = useTranslations("Schemas.stockBalanceSchema");
  const formSchema = getStockBalanceSchema(st);

  const form = useFormContext<z.infer<typeof formSchema>>();

  return (
    <TableRow className="border-none">
      <Cell>
        <div className="h-10 w-full px-3 py-2 text-sm border-input border">
          {stockName}
        </div>
      </Cell>
      <Cell>
        <CellField
          control={form.control}
          name={`balance.${index}.quantity`}
          type="number"
        />
      </Cell>
    </TableRow>
  );
};

export default StockBalanceItem;
