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

export const useQuotationsAIAnalysisStore = create<QuotationsAIAnalysisState>(
  (set) => ({
    quotations: [],
    rfqItems: [],
    addQuotation: (quotation: QuotationWithCompanyType) =>
      set((state) => ({ quotations: [...state.quotations, quotation] })),
    removeQuotation: (quotation: QuotationWithCompanyType) =>
      set((state) => ({
        quotations: state.quotations.filter(
          (element) => element.id !== quotation.id
        ),
      })),
    addRfqItem: (rfqItem: RequestForQuotationItemType) =>
      set((state) => ({ rfqItems: [...state.rfqItems, rfqItem] })),
    removeRfqItem: (rfqItem: RequestForQuotationItemType) =>
      set((state) => ({
        rfqItems: state.rfqItems.filter((element) => element.id !== rfqItem.id),
      })),
  })
);
