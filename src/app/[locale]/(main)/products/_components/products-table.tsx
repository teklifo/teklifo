import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ProductWithPricesAndStocks } from "@/types";

type ProductsTableProps = {
  products: ProductWithPricesAndStocks[];
};

const CellLink = ({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={`/products/${id}`}
      className="underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
};

const ProductsTable = ({ products }: ProductsTableProps) => {
  const t = useTranslations("Product");

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("number")}</TableHead>
          <TableHead>{t("unit")}</TableHead>
          <TableHead>{t("brand")}</TableHead>
          <TableHead>{t("brandNumber")}</TableHead>
          <TableHead>{t("id")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className={cn(product.archive && "text-muted-foreground")}
          >
            <TableCell>
              <CellLink id={product.id}>{product.name}</CellLink>
            </TableCell>
            <TableCell>
              <CellLink id={product.id}>{product.number}</CellLink>
            </TableCell>
            <TableCell>
              <CellLink id={product.id}>{product.unit}</CellLink>
            </TableCell>
            <TableCell>
              <CellLink id={product.id}>{product.brand}</CellLink>
            </TableCell>
            <TableCell>
              <CellLink id={product.id}>{product.brandNumber}</CellLink>
            </TableCell>
            <TableCell>
              <CellLink id={product.id}>{product.id}</CellLink>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductsTable;
