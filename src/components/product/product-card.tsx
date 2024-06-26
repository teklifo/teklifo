import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import PriceTable from "@/components/price-table";
import BalanceTable from "@/components/stock-balance-table";
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

type ProductCardProps = {
  product: ProductWithPricesAndStocks;
  children?: React.ReactNode;
};

const ProductCard = ({
  product: { id, name, number, description, prices, stock, unit },
  children,
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
        {children ? (
          children
        ) : (
          <Link
            href={`/product/${id}`}
            className={cn("space-x-2", buttonVariants({ variant: "default" }))}
          >
            {t("more")}
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
