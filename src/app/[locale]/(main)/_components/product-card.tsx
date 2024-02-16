import Link from "next/link";
import { useTranslations } from "next-intl";
import PriceTable from "./price-table/";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductWithPricesAndStocks } from "@/types";
import BalanceTable from "./stock-balance-table";

type ProductCardProps = {
  product: ProductWithPricesAndStocks;
};

const ProductCard = ({
  product: { id, name, number, description, prices, stock, unit },
}: ProductCardProps) => {
  const t = useTranslations("Product");

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{number}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="price">
            <AccordionTrigger>{t("price")}</AccordionTrigger>
            <AccordionContent>
              <PriceTable prices={prices} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="balance">
            <AccordionTrigger>{t("balance")}</AccordionTrigger>
            <AccordionContent>
              <BalanceTable stock={stock} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href={`/product/${id}`}
          className={cn("space-x-2", buttonVariants({ variant: "default" }))}
        >
          {t("more")}
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
