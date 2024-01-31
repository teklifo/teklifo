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

// CML TYPES

export type CommerceML_Import = {
  КоммерческаяИнформация: {
    Каталог: CommerceML_Каталог[];
  };
};

export type CommerceML_Каталог = {
  Товары: CommerceML_Товары[];
  $?: {
    СодержитТолькоИзменения: string;
  };
  СодержитТолькоИзменения?: string[];
};

export type CommerceML_Товары = {
  Товар: {
    Ид: string[];
    Наименование: string[];
    Артикул: string[];
    ШтрихКод?: string[];
    Изготовитель?: CommerceML_Изготовитель;
    БазоваяЕдиница: { $: { НаименованиеПолное: string } }[];
    Описание?: string[];
    Картинка?: string[];
  }[];
};

export type CommerceML_Изготовитель = {
  Ид: string[];
  Наименование: string[];
};
