import { create } from "zustand";

export type RiskLevel = "low" | "med" | "high";
export type TokenRow = {
  ca: string;
  ticker: string;
  name: string;
  mc: number;
  price: number;
  vol24h: number;
  lp: number;
  spark: number[];        // last N points
  risk: RiskLevel;
  flags?: { 
    bundled?: boolean; 
    devSold?: boolean; 
    siteReused?: boolean;
    dexUpdated?: boolean;
  };
  tags?: ("whale-in"|"early"|"sniper"|"kol")[];
  // Additional fields for command mapping
  supply?: number;
  ath?: number;
  athTime?: string;
  age?: number; // in hours
  whaleInflow?: number;
};

type ScannerState = {
  query: string;
  mode: "standard" | "advanced";
  filters: {
    group: "top" | "wallets" | "early" | "security" | "socials" | "bundles";
    whales?: boolean;
    early?: boolean;
    snipers?: boolean;
    kol?: boolean;
    riskyOnly?: boolean;
  };
  tokens: TokenRow[];
  selected?: TokenRow | null;
  selectedToken?: TokenRow | null;
  selectedFeature?: string | null;
  setQuery: (q: string) => void;
  setMode: (m: "standard" | "advanced") => void;
  setFilters: (p: Partial<ScannerState["filters"]>) => void;
  setTokens: (t: TokenRow[]) => void;
  select: (t: TokenRow | null) => void;
  setSelectedToken: (t: TokenRow | null) => void;
  setSelectedFeature: (f: string | null) => void;
};

export const useScanner = create<ScannerState>((set) => ({
  query: "",
  mode: "standard",
  filters: { group: "top" },
  tokens: [],
  selected: null,
  selectedToken: null,
  selectedFeature: null,
  setQuery: (q) => set({ query: q }),
  setMode: (m) => set({ mode: m }),
  setFilters: (p) => set(s => ({ filters: { ...s.filters, ...p } })),
  setTokens: (t) => set({ tokens: t }),
  select: (t) => set({ selected: t }),
  setSelectedToken: (t) => set({ selectedToken: t }),
  setSelectedFeature: (f) => set({ selectedFeature: f }),
}));
