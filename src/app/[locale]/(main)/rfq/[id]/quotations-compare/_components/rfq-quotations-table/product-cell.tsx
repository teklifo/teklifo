import { useFormatter, useTranslations } from "next-intl";
import { format } from "date-fns";
import { Link } from "@/navigation";
import { QuotationsByRFQItemType } from "@/types";

type ProductCellProps = {
  row: QuotationsByRFQItemType;
};

const ProductCell = ({ row }: ProductCellProps) => {
  const t = useTranslations("QuotationsCompare");
  const intlFormat = useFormatter();

  const { product, productName, price, quantity, deliveryDate } = row;

  return (
    <div className="p-4 space-y-2 mb-16">
      {product?.id ? (
        <Link href={`/product/${product.id}`} className="block w-full">
          <span className="underline underline-offset-4 text-xl">
            {productName}
          </span>
        </Link>
      ) : (
        <span className="text-xl">{productName}</span>
      )}
      <p className="text-sm text-muted-foreground">
        {`${t("rfqAmount")}: ${intlFormat.number(
          Number(quantity) * Number(price),
          {
            style: "decimal",
            minimumFractionDigits: 2,
          }
        )}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("rfqPrice")}: ${intlFormat.number(Number(price), {
          style: "currency",
          currency: "AZN",
        })}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("quantity")}: ${intlFormat.number(Number(quantity), {
          style: "decimal",
          minimumFractionDigits: 3,
        })}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("deliveryDate")}: ${format(deliveryDate, "dd.MM.yyyy")}`}
      </p>
    </div>
  );
};

export default ProductCell;