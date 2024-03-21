import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

type RequestForQuotationProductsType =
  Prisma.RequestForQuotationProductsGetPayload<{
    include: { product: true };
  }>;

type RFQProductCardProps = {
  number: number;
  currency: string;
  product: RequestForQuotationProductsType;
};

export const RFQProductCard = async ({
  number,
  currency,
  product: { product, quantity, price, deliveryDate, comment },
}: RFQProductCardProps) => {
  const t = await getTranslations("RFQ");

  return (
    <Card className="h-full w-full">
      <CardHeader className="flex flex-col justify-between space-y-0">
        <div className="flex flex-row items-start text-2xl font-semibold tracking-tight space-x-8">
          <span className="">{`#${number}`}</span>
          <span>{product?.name || t("unknowProduct")}</span>
        </div>
        {product && (
          <>
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
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:space-x-4">
          <div className="flex flex-row items-center space-x-2">
            <span className="font-semibold">{`${t("quantity")}:`}</span>
            <span className="text-xl">{Number(quantity).toFixed(3)}</span>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <span className="font-semibold">{`${t("price")}:`}</span>
            <span className="text-xl">{`${Number(price).toFixed(
              2
            )} ${currency}`}</span>
          </div>
          <div className="flex flex-row items-center space-x-2">
            <span className="font-semibold">{`${t("deliveryDate")}:`}</span>
            <span className="text-xl">
              {format(deliveryDate, "dd.MM.yyyy")}
            </span>
          </div>
        </div>
      </CardContent>
      {comment && (
        <CardFooter>
          <div className="flex flex-row space-x-2">
            <span className="font-semibold">{`${t("comment")}:`}</span>
            <span>{comment}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
