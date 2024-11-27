import { create } from "zustand";
import { RequestForQuotationItem as RequestForQuotationItemType } from "@prisma/client";
import { QuotationWithCompanyType } from "@/types";

interface QuotationsAIAnalysisState {
  quotations: QuotationWithCompanyType[];
  rfqItems: string[];
  addQuotation: (quotation: QuotationWithCompanyType) => void;
  removeQuotation: (quotation: QuotationWithCompanyType) => void;
  setRfqItems: (rfqItem: string[]) => void;
  reset: () => void;
}

const MAX_QUOTS = 3;
const MAX_ITEMS = 10;

const initialState = {
  quotations: [],
  rfqItems: [],
};

export const useQuotationsAIAnalysisStore = create<QuotationsAIAnalysisState>(
  (set) => ({
    ...initialState,
    addQuotation: (quotation: QuotationWithCompanyType) =>
      set((state) => ({
        quotations:
          state.quotations.length < MAX_QUOTS &&
          !state.quotations.find((quot) => quot.id === quotation.id)
            ? [...state.quotations, quotation]
            : state.quotations,
      })),
    removeQuotation: (quotation: QuotationWithCompanyType) =>
      set((state) => ({
        quotations: state.quotations.filter(
          (element) => element.id !== quotation.id
        ),
      })),

    setRfqItems: (rfqItems: string[]) =>
      set((state) => ({
        rfqItems: rfqItems.length <= MAX_ITEMS ? rfqItems : state.rfqItems,
      })),
    reset: () => {
      set(initialState);
    },
  })
);
