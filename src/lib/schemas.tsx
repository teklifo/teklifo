import * as z from "zod";
import { TranslateFunction } from "@/types";

export const getCompanySchema = (t: TranslateFunction) => {
  return z.object({
    id: z
      .string({
        required_error: t("invalidId"),
        invalid_type_error: t("invalidId"),
      })
      .min(1, t("invalidId")),
    name: z
      .string({
        required_error: t("invalidName"),
        invalid_type_error: t("invalidName"),
      })
      .min(1, t("invalidName")),
    tin: z
      .string({
        required_error: t("invalidTin"),
        invalid_type_error: t("invalidTin"),
      })
      .length(10, t("invalidTin"))
      .refine((data) => /^\d+$/.test(data), {
        message: t("numericTin"),
      }),
    description: z.string().default(""),
    descriptionRu: z.string().default(""),
    slogan: z.string().default(""),
    sloganRu: z.string().default(""),
  });
};

export const getStockSchema = (t: TranslateFunction) => {
  return z.object({
    name: z
      .string({
        required_error: t("invalidName"),
        invalid_type_error: t("invalidName"),
      })
      .min(1, t("invalidName")),
  });
};

export const getPriceTypeSchema = (t: TranslateFunction) => {
  return z.object({
    name: z
      .string({
        required_error: t("invalidName"),
        invalid_type_error: t("invalidName"),
      })
      .min(1, t("invalidName")),
    currency: z
      .string({
        required_error: t("invalidCurrency"),
        invalid_type_error: t("invalidCurrency"),
      })
      .min(1, t("invalidCurrency")),
  });
};

export const getMemberSchema = (t: TranslateFunction) => {
  return z.object({
    roleId: z
      .string({
        required_error: t("invalidRoleId"),
        invalid_type_error: t("invalidRoleId"),
      })
      .min(1, t("invalidRoleId")),
  });
};

export const getInvitationSchema = (t: TranslateFunction) => {
  return z.object({
    email: z
      .string({
        required_error: t("invalidEmail"),
        invalid_type_error: t("invalidEmail"),
      })
      .email(t("invalidEmail")),
    roleId: z
      .string({
        required_error: t("invalidRoleId"),
        invalid_type_error: t("invalidRoleId"),
      })
      .min(1, t("invalidRoleId")),
  });
};

export const getRoleSchema = (t: TranslateFunction) => {
  return z.object({
    name: z
      .string({
        required_error: t("invalidName"),
        invalid_type_error: t("invalidName"),
      })
      .min(1, t("invalidName")),
    availableData: z.array(
      z.object({
        stockId: z
          .string({
            required_error: t("invalidStockId"),
            invalid_type_error: t("invalidStockId"),
          })
          .min(1, t("invalidStockId")),
        priceTypes: z.array(
          z.object({
            priceTypeId: z
              .string({
                required_error: t("invalidPriceTypeId"),
                invalid_type_error: t("invalidPriceTypeId"),
              })
              .min(1, t("invalidPriceTypeId")),
          })
        ),
      })
    ),
  });
};

export const getCredentialsSchema = (t: TranslateFunction) => {
  return z.object({
    email: z
      .string({
        required_error: t("invalidEmail"),
        invalid_type_error: t("invalidEmail"),
      })
      .email(t("invalidEmail")),
    password: z
      .string({
        required_error: t("invalidPassword"),
        invalid_type_error: t("invalidPassword"),
      })
      .min(1, t("invalidPassword")),
  });
};

export const getUserSchema = (t: TranslateFunction) => {
  return z.object({
    name: z.string().optional(),
    password: z
      .string()
      .min(6, t("invalidPasswordLength"))
      .optional()
      .or(z.literal("")),
  });
};

export const getProductSchema = (t: TranslateFunction) => {
  return z.object({
    id: z.number().optional(),
    externalId: z.string().default("").nullable(),
    name: z
      .string({
        required_error: t("invalidName"),
        invalid_type_error: t("invalidName"),
      })
      .min(1, t("invalidName")),
    number: z
      .string({
        required_error: t("invalidNumber"),
        invalid_type_error: t("invalidNumber"),
      })
      .min(1, t("invalidNumber")),
    brand: z.string().default(""),
    brandNumber: z.string().default(""),
    unit: z.string().default(""),
    description: z.string().default(""),
    archive: z.boolean(),
  });
};

export const getProductsSchema = (t: TranslateFunction) => {
  return z.array(getProductSchema(t));
};

export const getRFQSchema = (t: TranslateFunction) => {
  return z.object({
    id: z.string().optional(),
    number: z.number().optional(),
    publicRequest: z
      .boolean({
        required_error: t("invalidPublicRequest"),
        invalid_type_error: t("invalidPublicRequest"),
      })
      .default(false),
    currency: z
      .string({
        required_error: t("invalidCurrency"),
        invalid_type_error: t("invalidCurrency"),
      })
      .min(1, t("invalidCurrency")),
    startDate: z.coerce.date({
      errorMap: (issue, { defaultError }) => ({
        message:
          issue.code === "invalid_date"
            ? t("invalidRFQStartDate")
            : defaultError,
      }),
    }),
    endDate: z.coerce.date({
      errorMap: (issue, { defaultError }) => ({
        message:
          issue.code === "invalid_date" ? t("invalidRFQEndDate") : defaultError,
      }),
    }),
    description: z.string().default(""),
    deliveryAddress: z.string().default(""),
    deliveryTerms: z.string().default(""),
    paymentTerms: z.string().default(""),
    products: z.array(getRFQProductSchema(t)).min(1, t("invalidProducts")),
  });
};

export const getRFQProductSchema = (t: TranslateFunction) => {
  return z.object({
    productId: z.coerce
      .number({
        required_error: t("invalidProductId"),
        invalid_type_error: t("invalidProductId"),
      })
      .min(0.001, t("invalidProductId")),
    product: getProductSchema(() => {
      return "";
    }).optional(),
    quantity: z.coerce
      .number({
        required_error: t("invalidQuantity"),
        invalid_type_error: t("invalidQuantity"),
      })
      .min(0.001, t("invalidQuantity")),
    price: z.coerce
      .number({
        required_error: t("invalidPrice"),
        invalid_type_error: t("invalidPrice"),
      })
      .min(0.001, t("invalidPrice")),
    deliveryDate: z.coerce.date({
      errorMap: (issue, { defaultError }) => ({
        message:
          issue.code === "invalid_date"
            ? t("invalidDeliveryDate")
            : defaultError,
      }),
    }),
    comment: z.string().default(""),
  });
};
