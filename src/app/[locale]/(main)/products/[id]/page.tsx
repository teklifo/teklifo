import { Metadata } from "next";
import { useTranslations } from "next-intl";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
import { Separator } from "@/components/ui/separator";
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

  const { name, number, description } = product;

  return {
    title: `${name} | ${number} | ${t("projectName")}`,
    description: `${name} | ${number} | ${description}`,
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
    <>
      <div className="flex flex-row space-x-2">
        <span>{`${label}:`}</span>
        <span className="font-semibold">{value || t("noData")}</span>
      </div>
      {/* <Separator className="w-full" /> */}
    </>
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

  return (
    <MaxWidthWrapper className="mt-8 mb-20">
      <div className="space-y-2">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          {name}
        </h1>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 mt-6 gap-0 gap-y-6 lg:grid-cols-12 lg:gap-4">
          <div className="col-span-8 space-y-6 mt-4 lg:mt-0">
            <div className="space-y-3">
              <ProductInfo label={t("number")} value={number} />
              <ProductInfo label={t("unit")} value={unit} />
              <ProductInfo label={t("brand")} value={brand} />
              <ProductInfo label={t("brandNumber")} value={brandNumber} />
            </div>
          </div>
          <div className="col-span-4 w-fit lg:w-auto">
            <p className="text-center font-semibold mb-2">{`${t(
              "company"
            )}:`}</p>
            <CompanyAvatar
              company={company}
              className="flex flex-col justify-center items-center"
            />
          </div>
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
