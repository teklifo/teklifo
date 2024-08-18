import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { QuotationsByRFQItemType } from "@/types";

type ProductCellProps = {
  row: QuotationsByRFQItemType;
};

const ProductCell = ({ row }: ProductCellProps) => {
  const t = useTranslations("QuotationsCompare");
  const format = useFormatter();

  const { product, productName, price, quantity } = row;

  return (
    <div className="p-4 space-y-2">
      {product?.productId ? (
        <Link href={`/product/${product.productId}`} className="block w-full">
          <span className="underline underline-offset-4 text-xl">
            {productName}
          </span>
        </Link>
      ) : (
        <span className="text-xl">{productName}</span>
      )}
      <p className="text-sm text-muted-foreground">
        {`${t("rfqAmount")}: ${format.number(Number(quantity) * Number(price), {
          style: "decimal",
          minimumFractionDigits: 2,
        })}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("rfqPrice")}: ${format.number(Number(price), {
          style: "currency",
          currency: "AZN",
        })}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("quantity")}: ${format.number(Number(quantity), {
          style: "decimal",
          minimumFractionDigits: 3,
        })}`}
      </p>
    </div>
  );
};

export default ProductCell;
