import * as z from "zod";
import { addDays } from "date-fns";
import parsePhoneNumberFromString from "libphonenumber-js";
import CURRENCIES from "@/lib/currencies";
import { TranslateFunction } from "@/types";

export const getCompanySchema = (t: TranslateFunction) => {
  return z.object({
    id: z
      .string({
        required_error: t("invalidId"),
        invalid_type_error: t("invalidId"),
      })
      .min(1, t("invalidId"))
      .max(20, t("invalidIdLength"))
      .regex(/^[a-z]+(-[a-z]+)*$/, t("invalidIdFormat")),
    name: z
      .string({
        required_error: t("invalidName"),
        invalid_type_error: t("invalidName"),
      })
      .min(1, t("invalidName"))
      .max(50, t("invalidNameLength")),
    tin: z
      .string({
        required_error: t("invalidTin"),
        invalid_type_error: t("invalidTin"),
      })
      .length(10, t("invalidTin"))
      .refine((data) => /^\d+$/.test(data), {
        message: t("numericTin"),
      }),
    email: z
      .string({
        required_error: t("invalidEmail"),
        invalid_type_error: t("invalidEmail"),
      })
      .email({
        message: t("invalidEmail"),
      }),
    phone: z
      .string({
        required_error: t("invalidPhone"),
        invalid_type_error: t("invalidPhone"),
      })
      .transform((arg, ctx) => {
        const phone = parsePhoneNumberFromString(arg, {
          extract: false,
        });

        if (phone && phone.isValid()) {
          return phone.number;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("invalidPhone"),
        });

        return z.NEVER;
      }),
    website: z.string().optional(),
    description: z.string().default(""),
    descriptionRu: z.string().default(""),
    slogan: z.string().max(100, t("invalidSloganLenght")).default(""),
    sloganRu: z.string().max(100, t("invalidSloganLenght")).default(""),
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
    currency: z.custom<string>(
      (val) => CURRENCIES.includes(val as string),
      t("invalidCurrency")
    ),
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
    externalId: z.string().optional(),
    number: z.number().optional(),
    title: z
      .string({
        required_error: t("invalidTitle"),
        invalid_type_error: t("invalidTitle"),
      })
      .min(1, t("invalidTitle"))
      .max(100, "invalidTitleLength"),
    privateRequest: z
      .boolean({
        required_error: t("invalidPublicRequest"),
        invalid_type_error: t("invalidPublicRequest"),
      })
      .default(false),
    currency: z.custom<string>(
      (val) => CURRENCIES.includes(val as string),
      t("invalidCurrency")
    ),
    endDate: z.coerce
      .date({
        errorMap: (issue, { defaultError }) => ({
          message:
            issue.code === "invalid_date" ? t("invalidDate") : defaultError,
        }),
      })
      .min(new Date(Date.now()), t("invalidDate")),
    contactPerson: z
      .string({
        required_error: t("invalidContactPerson"),
        invalid_type_error: t("invalidContactPerson"),
      })
      .min(1, t("invalidContactPerson")),
    email: z
      .string({
        required_error: t("invalidEmail"),
        invalid_type_error: t("invalidEmail"),
      })
      .email({
        message: t("invalidEmail"),
      }),
    phone: z
      .string({
        required_error: t("invalidPhone"),
        invalid_type_error: t("invalidPhone"),
      })
      .transform((arg, ctx) => {
        const phone = parsePhoneNumberFromString(arg, {
          extract: false,
        });

        if (phone && phone.isValid()) {
          return phone.number;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("invalidPhone"),
        });

        return z.NEVER;
      }),
    description: z.string().default(""),
    deliveryAddress: z.string().min(1, t("invalidDeliveryAddress")),
    deliveryTerms: z.string().default(""),
    paymentTerms: z.string().default(""),
    items: z.array(getRFQItemSchema(t)).min(1, t("invalidProducts")),
  });
};

export const getRFQItemSchema = (t: TranslateFunction) => {
  return z.object({
    id: z.string().optional(),
    externalId: z.string().optional(),
    productName: z
      .string({
        required_error: t("invalidProductName"),
        invalid_type_error: t("invalidProductName"),
      })
      .min(1, t("invalidProductName")),
    productId: z.coerce
      .number({
        required_error: t("invalidProductId"),
        invalid_type_error: t("invalidProductId"),
      })
      .optional(),
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
      .min(0.01, t("invalidPrice")),
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

export const getQuotationSchema = (t: TranslateFunction) => {
  return z.object({
    id: z.number().optional(),
    externalId: z.string().optional(),
    rfqVersionId: z.string({
      required_error: t("invalidRFQVersionId"),
      invalid_type_error: t("invalidRFQVersionId"),
    }),
    rfqId: z.string({
      required_error: t("invalidRFQId"),
      invalid_type_error: t("invalidRFQId"),
    }),
    currency: z.custom<string>(
      (val) => CURRENCIES.includes(val as string),
      t("invalidCurrency")
    ),
    contactPerson: z
      .string({
        required_error: t("invalidContactPerson"),
        invalid_type_error: t("invalidContactPerson"),
      })
      .min(1, t("invalidContactPerson")),
    email: z
      .string({
        required_error: t("invalidEmail"),
        invalid_type_error: t("invalidEmail"),
      })
      .email({
        message: t("invalidEmail"),
      }),
    phone: z
      .string({
        required_error: t("invalidPhone"),
        invalid_type_error: t("invalidPhone"),
      })
      .transform((arg, ctx) => {
        const phone = parsePhoneNumberFromString(arg, {
          extract: false,
        });

        if (phone && phone.isValid()) {
          return phone.number;
        }

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("invalidPhone"),
        });

        return z.NEVER;
      }),
    vatIncluded: z.boolean().default(true),
    description: z.string().default(""),
    items: z.array(getQuotationItemSchema(t)).min(1, t("invalidProducts")),
  });
};

export const getQuotationItemSchema = (t: TranslateFunction) => {
  return z
    .object({
      id: z.string().optional(),
      externalId: z.string().optional(),
      rfqItemVersionId: z.string({
        required_error: t("invalidRFQItemVersionId"),
        invalid_type_error: t("invalidRFQItemVersionId"),
      }),
      rfqItemId: z.string({
        required_error: t("invalidRFQItemId"),
        invalid_type_error: t("invalidRFQItemId"),
      }),
      productName: z
        .string({
          required_error: t("invalidProductName"),
          invalid_type_error: t("invalidProductName"),
        })
        .min(1, t("invalidProductName")),
      productId: z.coerce
        .number({
          required_error: t("invalidProductId"),
          invalid_type_error: t("invalidProductId"),
        })
        .optional(),
      product: getProductSchema(() => {
        return "";
      }).optional(),
      skip: z.boolean().default(false),
      quantity: z.coerce.number({
        required_error: t("invalidQuantity"),
        invalid_type_error: t("invalidQuantity"),
      }),
      price: z.coerce.number({
        required_error: t("invalidPrice"),
        invalid_type_error: t("invalidPrice"),
      }),
      amount: z.coerce.number({
        required_error: t("invalidAmount"),
        invalid_type_error: t("invalidAmount"),
      }),
      vatRate: z.enum(["NOVAT", "VAT0", "VAT18", "VAT20"], {
        required_error: t("invalidVatRate"),
        invalid_type_error: t("invalidVatRate"),
      }),
      deliveryDate: z.coerce.date({
        errorMap: (issue, { defaultError }) => ({
          message:
            issue.code === "invalid_date"
              ? t("invalidDeliveryDate")
              : defaultError,
        }),
      }),
      comment: z.string().default(""),
    })
    .superRefine((schema, ctx) => {
      if (schema.skip) return;

      if (schema.quantity < 0.001) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 0.001,
          inclusive: true,
          type: "number",
          path: ["quantity"],
          message: t("invalidQuantity"),
        });
      }

      if (schema.price < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 0.01,
          inclusive: true,
          type: "number",
          path: ["price"],
          message: t("invalidPrice"),
        });
      }

      if (schema.amount < 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 0.01,
          inclusive: true,
          type: "number",
          path: ["amount"],
          message: t("invalidAmount"),
        });
      }
    });
};

export const getRFQFiltersSchema = (t: TranslateFunction) => {
  return z.object({
    company: z.array(
      z.object({ id: z.string(), name: z.string(), tin: z.string() })
    ),
    endDate: z
      .object(
        {
          from: z.coerce
            .date({
              errorMap: (issue, { defaultError }) => ({
                message:
                  issue.code === "invalid_date"
                    ? t("invalidDate")
                    : defaultError,
              }),
            })
            .optional(),
          to: z.coerce
            .date({
              errorMap: (issue, { defaultError }) => ({
                message:
                  issue.code === "invalid_date"
                    ? t("invalidDate")
                    : defaultError,
              }),
            })
            .optional(),
        },
        {
          required_error: t("invalidDate"),
          invalid_type_error: t("invalidDate"),
        }
      )
      .optional(),
  });
};

export const getImportDataSchema = (t: TranslateFunction) => {
  return z.object({
    importType: z.enum(["products", "prices", "balance"], {
      required_error: t("invalidImportType"),
      invalid_type_error: t("invalidImportType"),
    }),
    file: z.instanceof(File, { message: t("invalidFile") }),
  });
};

export const getPriceSchema = (t: TranslateFunction) => {
  return z.object({
    prices: z.array(
      z.object({
        productId: z.coerce.number({
          required_error: t("invalidProductId"),
          invalid_type_error: t("invalidProductId"),
        }),
        priceTypeId: z
          .string({
            required_error: t("invalidPriceTypeId"),
            invalid_type_error: t("invalidPriceTypeId"),
          })
          .min(1, t("invalidPriceTypeId")),
        priceTypeName: z.string().optional(),
        priceTypeCurrency: z.string().optional(),
        price: z.coerce.number({
          required_error: t("invalidPrice"),
          invalid_type_error: t("invalidPrice"),
        }),
      })
    ),
  });
};

export const getStockBalanceSchema = (t: TranslateFunction) => {
  return z.object({
    balance: z.array(
      z.object({
        productId: z.coerce.number({
          required_error: t("invalidProductId"),
          invalid_type_error: t("invalidProductId"),
        }),
        stockId: z
          .string({
            required_error: t("invalidStockId"),
            invalid_type_error: t("invalidStockId"),
          })
          .min(1, t("invalidStockId")),
        stockName: z.string().optional(),
        quantity: z.coerce.number({
          required_error: t("invalidQuantity"),
          invalid_type_error: t("invalidQuantity"),
        }),
      })
    ),
  });
};

export const getQuotsAIAnalysisSchema = (t: TranslateFunction) => {
  return z.object({
    quotations: z.array(z.number()),
    rfqItems: z.array(z.string()),
  });
};
