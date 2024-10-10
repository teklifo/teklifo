import { Prisma } from "@prisma/client";
import { ZodIssue } from "zod";

export type EmailType = "email-verification";

export type EmailContextType = {
  [key: string]: string;
};

export type ApiError = {
  message: string;
  errors: ZodIssue[];
};

export type PaginationType = {
  skipped: number;
  current: number;
  total: number;
};

export type FlattenAvailableDataType = { stockId: string; priceTypeId: string };

export type Log = {
  id: string;
  status: "success" | "error";
  message?: string;
};

export type ProductWithPricesAndStocks = Prisma.ProductGetPayload<{
  include: {
    company: {
      select: {
        id: true;
        name: true;
      };
    };
    prices: { include: { priceType: true } };
    stock: { include: { stock: true } };
  };
}>;

export type TranslateFunction = (value: string) => string;

export type RFQWithQuotationsType = Prisma.RequestForQuotationGetPayload<{
  include: {
    company: true;
    _count: {
      select: {
        quotations: true;
      };
    };
  };
}>;

export type QuotationsByRFQItemType = Prisma.RequestForQuotationItemGetPayload<{
  include: {
    product: {
      select: {
        id: true;
      };
    };
    quotationItems: {
      include: {
        quotation: {
          select: {
            id: true;
            totalAmount: true;
            currency: true;
            vatIncluded: true;
            rfq: {
              select: {
                latestVersion: true;
              };
            };
            company: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export type ProductPriceType = Prisma.PriceTypeGetPayload<{
  include: {
    prices: true;
  };
}>;

// CML TYPES

export type CML_Import = {
  КоммерческаяИнформация: {
    Каталог: CML_Каталог[];
  };
};

export type CML_Каталог = {
  Товары: [{ Товар: CML_Товар[] }];
  $?: {
    СодержитТолькоИзменения: string;
  };
  СодержитТолькоИзменения?: string[];
};

export type CML_Товар = {
  Ид: string[];
  Наименование: string[];
  Артикул: string[];
  ШтрихКод?: string[];
  Изготовитель?: CML_Изготовитель[];
  БазоваяЕдиница: { $: { НаименованиеПолное: string } }[];
  Описание?: string[];
  Картинка?: string[];
};

export type CML_Изготовитель = {
  Ид: string[];
  Наименование: string[];
};

export type CML_Offers = {
  КоммерческаяИнформация: {
    ПакетПредложений: CML_ПакетПредложений[];
  };
};

export type CML_ПакетПредложений = {
  Предложения: [
    {
      Предложение: CML_Предложение[];
    }
  ];
  ТипыЦен: [{ ТипЦены: CML_ТипЦены[] }];
  Склады: [{ Склад: CML_Склад[] }];
};

export type CML_Предложение = {
  Ид: string[];
  ШтрихКод?: string[];
  Артикул: string[];
  Наименование: string[];
  БазоваяЕдиница: { _: string }[];
  Цены: CML_ДанныеЦены[];
  Склад: CML_СвойстваОстатка[];
  Количество: string[];
};

export type CML_ДанныеЦены = { Цена: CML_Цена[] };

export type CML_Цена = {
  ИдТипаЦены: string[];
  ЦенаЗаЕдиницу: string[];
};

export type CML_ТипЦены = {
  Ид: string[];
  Наименование: string[];
  Валюта: string[];
};

export type CML_Склад = {
  Ид: string[];
  Наименование: string[];
};

export type CML_СвойстваОстатка = { $: CML_ОстатокНаСкладе };

export type CML_ОстатокНаСкладе = {
  ИдСклада: string;
  КоличествоНаСкладе: string;
};
