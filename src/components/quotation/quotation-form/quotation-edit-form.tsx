"use client";

import { useEffect, useState } from "react";
import { Prisma, Company as CompanyType } from "@prisma/client";
import request from "@/lib/request";
import QuotationForm from ".";
import { Loader } from "lucide-react";

type RFQType = Prisma.RequestForQuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationType = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

type QuotationEditFormProps = {
  currentCompany: CompanyType;
  rfq: RFQType;
  quotationId: number;
  closeDialog: () => void;
};

async function getQuotation(quotationId: number) {
  try {
    return await request<QuotationType>(`/api/quotation/${quotationId}`, {
      next: { revalidate: 0 },
    });
  } catch (error) {
    return undefined;
  }
}

const QuotationEditForm = ({
  currentCompany,
  rfq,
  closeDialog,
  quotationId,
}: QuotationEditFormProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [quotation, setQuotation] = useState<QuotationType>();

  useEffect(() => {
    const fetchQuotation = async () => {
      if (quotationId) {
        const result = await getQuotation(quotationId);
        if (result) {
          setQuotation(result);
        }
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId]);

  if (loading)
    return (
      <div className="w-[100%] h-[80vh] flex flex-col justify-center items-center">
        <Loader className="mr-2 animate-spin" />
      </div>
    );

  return (
    <QuotationForm
      currentCompany={currentCompany}
      rfq={rfq}
      quotation={quotation}
      closeDialog={closeDialog}
    />
  );
};

export default QuotationEditForm;
