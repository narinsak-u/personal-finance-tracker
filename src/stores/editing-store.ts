import { create } from "zustand";
import type { Transaction } from "@/types/transaction";

interface EditingStore {
  editingTransaction: Transaction | null;
  setEditing: (t: Transaction | null) => void;
}

export const useEditingStore = create<EditingStore>((set) => ({
  editingTransaction: null,
  setEditing: (editingTransaction) => set({ editingTransaction }),
}));
