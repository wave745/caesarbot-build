import { TokenRow } from "@/stores/scanner";
import { demoTokens, demoLiveFeed } from "./demo-data";

// Mock service layer for scanner data
export class ScannerService {
  private static instance: ScannerService;
  private useDemoData: boolean = false;

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  enableDemoData() {
    this.useDemoData = true;
  }

  disableDemoData() {
    this.useDemoData = false;
  }

  async getTokens(filters?: {
    group?: string;
    whales?: boolean;
    early?: boolean;
    snipers?: boolean;
    kol?: boolean;
    riskyOnly?: boolean;
  }): Promise<TokenRow[]> {
    if (!this.useDemoData) {
      // TODO: Replace with actual API call
      // Example: const response = await fetch('/api/tokens', { method: 'POST', body: JSON.stringify(filters) });
      // return response.json();
      
      // Return empty array for now - ready for real data integration
      return [];
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let tokens = [...demoTokens];
    
    if (filters?.riskyOnly) {
      tokens = tokens.filter(t => t.risk === "high");
    }
    
    if (filters?.whales) {
      // Filter for tokens with whale-in tag or high whale inflow
      tokens = tokens.filter(t => t.tags?.includes("whale-in") || (t.whaleInflow && t.whaleInflow > 200000));
    }
    
    if (filters?.early) {
      // Filter for tokens with early tag
      tokens = tokens.filter(t => t.tags?.includes("early"));
    }
    
    if (filters?.snipers) {
      // Filter for tokens with sniper tag
      tokens = tokens.filter(t => t.tags?.includes("sniper"));
    }
    
    if (filters?.kol) {
      // Filter for tokens with KOL tag
      tokens = tokens.filter(t => t.tags?.includes("kol"));
    }
    
    return tokens;
  }

  async getLiveFeed(): Promise<{ts: number, text: string}[]> {
    if (!this.useDemoData) {
      // TODO: Replace with actual real-time feed API
      // Example: const response = await fetch('/api/live-feed');
      // return response.json();
      
      // Return empty array for now - ready for real data integration
      return [];
    }

    // Simulate real-time feed
    await new Promise(resolve => setTimeout(resolve, 200));
    return demoLiveFeed;
  }

  // Mock data initialization removed - ready for real data integration
}

// Service instance ready for real data integration
const scannerService = ScannerService.getInstance();
