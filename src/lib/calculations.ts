import { VatRates } from "@prisma/client";

type VatRateInformation = {
  vatRate: VatRates;
  vatRatePercentage: number;
};

export function getVatRatePercentage(
  vatName: "NOVAT" | "VAT0" | "VAT18" | "VAT20"
): VatRateInformation {
  if (vatName === "VAT0")
    return { vatRate: VatRates.VAT0, vatRatePercentage: 0 };
  if (vatName === "VAT18")
    return { vatRate: VatRates.VAT18, vatRatePercentage: 18 };
  if (vatName === "VAT20")
    return { vatRate: VatRates.VAT20, vatRatePercentage: 20 };
  return { vatRate: VatRates.NOVAT, vatRatePercentage: 0 };
}

export function calculateVatAmount(amount: number, vatRatePercentage: number) {
  return (amount / 100) * vatRatePercentage;
}

export function calculateAmountWithVat(
  amount: number,
  vatAmount: number,
  vatIncluded: boolean
) {
  return amount + (vatIncluded ? 0 : vatAmount);
}
