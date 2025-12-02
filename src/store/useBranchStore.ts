// /src/store/useBranchStore.ts
import { create } from "zustand";

interface BranchStore {
  selectedBranch: any;
  isBranchManuallySelected: boolean;
  setBranch: (branch: any) => void;
  setAutoBranch: (branch: any) => void;
  clearBranch: () => void;
}

export const useBranchStore = create<BranchStore>((set) => ({
  selectedBranch: null,
  isBranchManuallySelected: false,

  setBranch: (branch: any) =>
    set({
      selectedBranch: branch,
      isBranchManuallySelected: true,
    }),

  setAutoBranch: (branch: any) =>
    set((state) =>
      state.isBranchManuallySelected ? state : { selectedBranch: branch }
    ),

  clearBranch: () =>
    set({
      selectedBranch: null,
      isBranchManuallySelected: false,
    }),
}));
