import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type QuotationItemType = Prisma.QuotationItemGetPayload<{
  include: { product: true; rfqItem: true };
}>;

type QuotationItemCardProps = {
  number: number;
  currency: string;
  item: QuotationItemType;
};

const QuotationItemAttribute = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-start">
      <span className="font-semibold">{label}</span>
      <span className="md:text-xl">{value}</span>
    </div>
  );
};

const QuotationItemCard = ({
  number,
  currency,
  item: {
    productName,
    product,
    rfqItem,
    quantity,
    price,
    amount,
    vatRate,
    vatIncluded,
    vatAmount,
    amountWithVat,
    deliveryDate,
    comment,
    skip,
  },
}: QuotationItemCardProps) => {
  const t = useTranslations("Quotation");

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col justify-between space-y-0 p-0 mb-4">
        {/* Product */}
        <div className="bg-muted p-6 rounded-md space-y-3">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("requested")}:`}
          </h4>
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
          <div className="flex flex-col space-y-2-md md:flex-row md:space-x-8 md:space-y-0">
            <div className="flex flex-col items-start">
              <span className="font-semibold">{`${t("quantity")}`}</span>
              <span className="md:text-xl">
                {Number(rfqItem.quantity).toFixed(3)}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{`${t("price")}`}</span>
              <span className="md:text-xl">{`${Number(rfqItem.price).toFixed(
                2
              )} ${currency}`}</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{`${t("deliveryDate")}`}</span>
              <span className="md:text-xl">
                {format(rfqItem.deliveryDate, "dd.MM.yyyy")}
              </span>
            </div>
          </div>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {rfqItem.comment}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 relative">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {`${t("quotationData")}:`}
          </h4>
          {!skip ? (
            <>
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-8 md:space-y-0">
                <QuotationItemAttribute
                  label={t("quantity")}
                  value={Number(quantity).toFixed(3)}
                />
                <QuotationItemAttribute
                  label={t("price")}
                  value={Number(price).toFixed(2)}
                />
                <QuotationItemAttribute
                  label={t("amount")}
                  value={Number(amount).toFixed(2)}
                />
              </div>
              <Separator />
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-8 md:space-y-0">
                <QuotationItemAttribute
                  label={t("vatRate")}
                  value={t(vatRate)}
                />
                <QuotationItemAttribute
                  label={t("vatAmount")}
                  value={Number(vatAmount).toFixed(2)}
                />
                <QuotationItemAttribute
                  label={t("vatIncluded")}
                  value={vatIncluded ? t("yes") : t("no")}
                />
                <QuotationItemAttribute
                  label={t("amountWithVat")}
                  value={Number(amountWithVat).toFixed(2)}
                />
              </div>
              <Separator />
              <div className="flex flex-col space-y-2 md:flex-row md:space-x-8 md:space-y-0">
                <QuotationItemAttribute
                  label={t("deliveryDate")}
                  value={format(deliveryDate, "dd.MM.yyyy")}
                />
              </div>
            </>
          ) : (
            <p className="text-destructive">{t("itemSkipped")}</p>
          )}
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

export default QuotationItemCard;
