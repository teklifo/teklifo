import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductWithPricesAndStocks } from "@/types";

type ProductCardProps = {
  product: ProductWithPricesAndStocks;
  children?: React.ReactNode;
};

const ProductCard = ({
  product: { id, name, number, unit },
  children,
}: ProductCardProps) => {
  const t = useTranslations("Product");

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{`${number}, ${unit}`}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        {children ? (
          children
        ) : (
          <Link
            href={`/products/${id}`}
            className={cn("space-x-2", buttonVariants({ variant: "default" }))}
          >
            <span>{t("more")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
