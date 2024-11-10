import { useFormatter, useTranslations } from "next-intl";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { QuotationOutdated, QuotationTotal } from "./quotation-main-info";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getAvatarFallback } from "@/lib/utils";
import { QuotationWithCompanyType } from "@/types";

const cardVariants = cva("", {
  variants: {
    variant: {
      default: "",
      primary: "bg-secondary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface QuotationCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  quotation: QuotationWithCompanyType;
}

const QuotationCard = ({
  quotation,
  className,
  variant,
  ...props
}: QuotationCardProps) => {
  const t = useTranslations("Quotation");
  const format = useFormatter();

  const { company, updatedAt } = quotation;

  return (
    <Card
      className={cn(
        "text-start cursor-pointer md:transition-shadow md:hover:shadow-lg md:hover:dark:bg-muted",
        cardVariants({ variant, className }),
        !quotation.rfq.latestVersion && "text-muted-foreground"
      )}
      {...props}
    >
      <div className="px-2">
        <CardHeader>
          <QuotationOutdated rfq={quotation.rfq} className="mb-2" />
          <div className="flex flex-row justify-start items-center space-x-4">
            <Avatar className="md:h-20 md:w-20">
              <AvatarFallback>{getAvatarFallback(company.name)}</AvatarFallback>
            </Avatar>
            <CardTitle className="break-words line-clamp-2">
              {company.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
          <QuotationTotal quotation={quotation} />
          <CardDescription>
            {`${t("updatedAt")}: ${format.relativeTime(new Date(updatedAt))}`}
          </CardDescription>
        </CardContent>
      </div>
    </Card>
  );
};

export default QuotationCard;
