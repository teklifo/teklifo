import { useTranslations } from "next-intl";
import { Prisma } from "@prisma/client";
import { Link } from "@/navigation";

export type RFQRow = Prisma.RequestForQuotationItemGetPayload<{
  include: {
    product: {
      select: {
        productId: true;
      };
    };
  };
}>;

type ProductCellProps = {
  row: RFQRow;
};

const ProductCell = ({ row }: ProductCellProps) => {
  const t = useTranslations("QuotationsCompare");

  const { product, productName, price, quantity } = row;

  return (
    <div className="p-4">
      {product?.productId ? (
        <Link href={`/product/${product.productId}`} className="block w-full">
          <span className="underline underline-offset-4">{productName}</span>
        </Link>
      ) : (
        <>{productName}</>
      )}
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        {Number(price).toFixed(2)}
      </p>
      <p className="text-sm text-muted-foreground">
        {`${t("quantity")}: ${Number(quantity).toFixed(3)}`}
      </p>
    </div>
  );
};

export default ProductCell;
