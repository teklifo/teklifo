import { useTranslations } from "next-intl";
import type { Prisma } from "@prisma/client";

type RequestForQuotationType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: {
      select: {
        id: true;
        name: true;
      };
    };
    items: {
      include: {
        product: true;
      };
    };
    participants: true;
  };
}>;

type RFQDataProps = {
  rfq: RequestForQuotationType;
};

const RFQData = ({ rfq }: RFQDataProps) => {
  const t = useTranslations("RFQ");

  const {
    description,
    paymentTerms,
    deliveryAddress,
    deliveryTerms,
    contactPerson,
    phone,
    email,
  } = rfq;

  return (
    <div className="mt-4">
      {(paymentTerms || deliveryTerms || deliveryAddress) && (
        <div className="space-y-4">
          {description && (
            <div className="space-y-2">
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("description")}
              </h3>
              <div className="whitespace-pre-line">{description}</div>
            </div>
          )}
          {paymentTerms && (
            <div className="space-y-2">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("paymentTerms")}
              </h4>
              <p className="whitespace-pre-line">{paymentTerms}</p>
            </div>
          )}
          {deliveryTerms && (
            <div className="space-y-2">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("deliveryTerms")}
              </h4>
              <p className="whitespace-pre-line">{deliveryTerms}</p>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {t("contacts")}
            </h4>
            <div className="space-y-1">
              <p className="whitespace-pre-line">{contactPerson}</p>
              <p className="whitespace-pre-line">{email}</p>
              <p className="whitespace-pre-line">{phone}</p>
            </div>
          </div>
          {deliveryAddress && (
            <div className="space-y-2">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {t("deliveryAddress")}
              </h4>
              <p className="whitespace-pre-line">{deliveryAddress}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RFQData;
