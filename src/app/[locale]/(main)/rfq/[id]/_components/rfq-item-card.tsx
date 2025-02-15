import { useFormatter, useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import ClientDate from "@/components/client-date";

type RequestForQuotationItemType = Prisma.RequestForQuotationItemGetPayload<{
  include: { product: true };
}>;

type RFQItemCardProps = {
  number: number;
  currency: string;
  item: RequestForQuotationItemType;
};

const RFQItemCard = ({
  number,
  currency,
  item: { productName, product, quantity, price, deliveryDate, comment },
}: RFQItemCardProps) => {
  const t = useTranslations("RFQ");
  const intlFormat = useFormatter();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col justify-between space-y-0">
        <p className="text-2xl font-semibold tracking-tight">
          {`#${number} ${productName}`}
        </p>
        {product && (
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
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-8 md:space-y-0">
          <div className="flex flex-col items-start">
            <span className="text-muted-foreground">{`${t("quantity")}`}</span>
            <span className="font-semibold">
              {intlFormat.number(Number(quantity), {
                style: "decimal",
                minimumFractionDigits: 3,
              })}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-muted-foreground">{`${t("price")}`}</span>
            <span className="font-semibold">
              {intlFormat.number(Number(price), {
                style: "currency",
                currency,
              })}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-muted-foreground">{`${t(
              "deliveryDate"
            )}`}</span>
            <span className="font-semibold">
              <ClientDate date={deliveryDate} format="dd.MM.yyyy" />
            </span>
          </div>
        </div>
      </CardContent>
      {comment && (
        <CardFooter>
          <div className="flex flex-col">
            <span className="text-muted-foreground">{`${t("comment")}`}</span>
            <span>{comment}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RFQItemCard;
