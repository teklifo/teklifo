import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

type RequestForQuotationItemType = Prisma.RequestForQuotationItemGetPayload<{
  include: { product: true };
}>;

type RFQItemCardProps = {
  number: number;
  currency: string;
  item: RequestForQuotationItemType;
};

const RFQItemCard = async ({
  number,
  currency,
  item: { product, quantity, price, deliveryDate, comment },
}: RFQItemCardProps) => {
  const t = await getTranslations("RFQ");

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col justify-between space-y-0">
        <p className="text-2xl font-semibold tracking-tight">
          {`#${number} ${product?.name || t("unknowProduct")}`}
        </p>
        <div className="text-sm">
          <div className="flex flex-row space-x-2">
            <span>{`${t("number")}:`}</span>
            <span>{product.number}</span>
          </div>
          <div className="flex flex-row space-x-2">
            <span>{`${t("unit")}:`}</span>
            <span>{product.unit}</span>
          </div>
          <div className="flex flex-row space-x-2">
            <span>{`${t("brand")}:`}</span>
            <span>{product.brand}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-8 md:space-y-0">
          <div className="flex flex-col items-start">
            <span className="font-semibold">{`${t("quantity")}`}</span>
            <span className="md:text-xl">{Number(quantity).toFixed(3)}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold">{`${t("price")}`}</span>
            <span className="md:text-xl">{`${Number(price).toFixed(
              2
            )} ${currency}`}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold">{`${t("deliveryDate")}`}</span>
            <span className="md:text-xl">
              {format(deliveryDate, "dd.MM.yyyy")}
            </span>
          </div>
        </div>
      </CardContent>
      {comment && (
        <CardFooter>
          <div className="flex flex-col">
            <span className="font-semibold">{`${t("comment")}`}</span>
            <span>{comment}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RFQItemCard;
