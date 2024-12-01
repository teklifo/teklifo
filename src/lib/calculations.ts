import { VatRates } from "@prisma/client";

type VatRateInformation = {
  vatRate: VatRates;
  vatRatePercentage: number;
};

export function getVatRatePercentage(
  vatName: "NOVAT" | "VAT0" | "VAT10" | "VAT18" | "VAT20"
): VatRateInformation {
  if (vatName === "VAT0")
    return { vatRate: VatRates.VAT0, vatRatePercentage: 0 };
  if (vatName === "VAT10")
    return { vatRate: VatRates.VAT10, vatRatePercentage: 10 };
  if (vatName === "VAT18")
    return { vatRate: VatRates.VAT18, vatRatePercentage: 18 };
  if (vatName === "VAT20")
    return { vatRate: VatRates.VAT20, vatRatePercentage: 20 };
  return { vatRate: VatRates.NOVAT, vatRatePercentage: 0 };
}

export function calculateVatAmount(
  amount: number,
  vatIncluded: boolean,
  vatRatePercentage: number
) {
  const amountWithoutVat = vatIncluded
    ? (100 * amount) / (100 + vatRatePercentage)
    : amount;

  const vatAmount = (amountWithoutVat * vatRatePercentage) / 100;

  return Math.round(vatAmount * 100) / 100;
}

export function calculateAmountWithVat(
  amount: number,
  vatAmount: number,
  vatIncluded: boolean
) {
  return amount + (vatIncluded ? 0 : vatAmount);
}
