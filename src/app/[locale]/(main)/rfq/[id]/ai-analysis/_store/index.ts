import { create } from "zustand";
import { RequestForQuotationItem as RequestForQuotationItemType } from "@prisma/client";
import { QuotationWithCompanyType } from "@/types";

interface QuotationsAIAnalysisState {
  quotations: QuotationWithCompanyType[];
  rfqItems: RequestForQuotationItemType[];
  addQuotation: (quotation: QuotationWithCompanyType) => void;
  removeQuotation: (quotation: QuotationWithCompanyType) => void;
  addRfqItem: (rfqItem: RequestForQuotationItemType) => void;
  removeRfqItem: (rfqItem: RequestForQuotationItemType) => void;
}

const MAX_QUOTS = 3;
const MAX_ITEMS = 10;

export const useQuotationsAIAnalysisStore = create<QuotationsAIAnalysisState>(
  (set) => ({
    quotations: [],
    rfqItems: [],
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
    addRfqItem: (rfqItem: RequestForQuotationItemType) =>
      set((state) => ({
        rfqItems:
          state.rfqItems.length < MAX_ITEMS &&
          !state.rfqItems.find((item) => item.id === rfqItem.id)
            ? [...state.rfqItems, rfqItem]
            : state.rfqItems,
      })),
    removeRfqItem: (rfqItem: RequestForQuotationItemType) =>
      set((state) => ({
        rfqItems: state.rfqItems.filter((element) => element.id !== rfqItem.id),
      })),
  })
);
