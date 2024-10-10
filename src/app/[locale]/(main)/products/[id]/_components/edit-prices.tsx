"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BriefcaseBusiness, Loader } from "lucide-react";
import PriceForm from "@/components/price/price-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import request from "@/lib/request";
import { ProductPriceType } from "@/types";

type EditPricesProps = {
  productId: number;
};

async function getProductPrices(productId: number) {
  try {
    return await request<ProductPriceType[]>(
      `/api/product/${productId}/price`,
      {
        next: { revalidate: 0 },
      }
    );
  } catch (error) {
    return [];
  }
}

const EditPrices = ({ productId }: EditPricesProps) => {
  const t = useTranslations("Product");

  const [productPrices, setProductPrices] = useState<ProductPriceType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchProductPrices = async () => {
      const result = await getProductPrices(productId);
      setProductPrices(result);
      setLoading(false);
    };
    fetchProductPrices();
  }, [productId]);

  if (loading)
    return (
      <div className="w-[100%] h-[80vh] flex flex-col justify-center items-center">
        <Loader className="mr-2 animate-spin" />
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {
          <Button className="text-center whitespace-normal h-auto space-x-2 lg:w-full">
            <BriefcaseBusiness className="mr-2 h-4 w-4" />
            <span>{t("editPrices")}</span>
          </Button>
        }
      </DialogTrigger>
      <DialogContent className="px-0 flex flex-col space-y-2 max-w-[100%] h-[100%] md:space-y-8 md:max-w-[90%] md:h-[95%] sm:p-6">
        <DialogHeader className="flex-initial">
          <DialogTitle>{t("pricesTitle")}</DialogTitle>
          <DialogDescription>{t("pricesSubtitle")}</DialogDescription>
        </DialogHeader>
        {productPrices && (
          <PriceForm
            productId={productId}
            productPrices={productPrices}
            closeDialog={closeDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPrices;
