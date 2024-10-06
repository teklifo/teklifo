import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { Pencil } from "lucide-react";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import CompanyAvatar from "@/components/company/company-avatar";
import PriceTable from "@/components/price-table";
import BalanceTable from "@/components/stock-balance-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import getCurrentCompany, {
  isCompanyAdmin,
} from "@/app/actions/get-current-company";
import { cn } from "@/lib/utils";
import request from "@/lib/request";
import { ProductWithPricesAndStocks } from "@/types";

type Props = {
  params: { locale: string; id: string };
};

type ProductInfoType = {
  label: string;
  value?: any;
};

export const generateMetadata = async ({
  params: { locale, id },
}: Props): Promise<Metadata> => {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const product = await getProduct(id);
  if (!product)
    return {
      title: `${t("projectName")}`,
      description: "",
    };

  const { name, number, description, company } = product;

  return {
    title: `${name} | ${number} | ${company.name}}`,
    description: `${name} | ${number} | ${company.name} | ${description}`,
  };
};

async function getProduct(id: string) {
  try {
    const cookieStore = cookies();
    const headersList = headers();
    const cookie = headersList.get("cookie");

    return await request<ProductWithPricesAndStocks>(`/api/product/${id}`, {
      headers: {
        "Accept-Language": cookieStore.get("NEXT_LOCALE")?.value,
        Cookie: cookie,
      },
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
}

const ProductInfo = ({ label, value }: ProductInfoType) => {
  const t = useTranslations("Product");

  return (
    <div className="flex flex-row space-x-2">
      <span>{`${label}:`}</span>
      <span className="font-semibold">{value || t("noData")}</span>
    </div>
  );
};

const Product = async ({ params: { id } }: Props) => {
  const t = await getTranslations("Product");

  const product = await getProduct(id);

  if (!product) {
    return notFound();
  }

  const {
    name,
    number,
    unit,
    brand,
    brandNumber,
    company,
    description,
    prices,
    stock,
  } = product;

  let isAdmin = false;
  const userCompany = await getCurrentCompany();
  if (userCompany && userCompany.id === company.id) {
    isAdmin = await isCompanyAdmin(userCompany.id);
  }

  return (
    <MaxWidthWrapper className="mt-8 mb-20">
      <div className="flex flex-col space-y-4 md:space-x-4 md:flex-row md:justify-between md:space-y-0">
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {name}
          </h1>
        </div>
        {isAdmin && (
          <Link
            href={`/edit-product/${product.id}`}
            className={cn(buttonVariants({ variant: "outline" }), "space-x-2")}
          >
            <Pencil className="w-4 -h-4" />
            <span>{t("update")}</span>
          </Link>
        )}
      </div>
      <div className="space-y-6">
        <div className="mt-6 w-fit">
          <p className="text-center font-semibold mb-2">{`${t("company")}:`}</p>
          <CompanyAvatar
            company={company}
            className="flex flex-col justify-center items-center"
          />
        </div>
        <div className="space-y-3">
          <ProductInfo label={t("number")} value={number} />
          <ProductInfo label={t("unit")} value={unit} />
          <ProductInfo label={t("brand")} value={brand} />
          <ProductInfo label={t("brandNumber")} value={brandNumber} />
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="description">
            <AccordionTrigger>{t("description")}</AccordionTrigger>
            <AccordionContent>
              <p>{description || t("noDescription")}</p>
            </AccordionContent>
          </AccordionItem>
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
      </div>
    </MaxWidthWrapper>
  );
};

export default Product;
