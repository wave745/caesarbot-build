import { TokenRow } from "@/stores/scanner";
import { ScannerMockData } from "@/lib/mock-data/scanner-mock-data";

// Service layer for scanner data
export class ScannerService {
  private static instance: ScannerService

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  async getTokens(filters?: {
    group?: string;
    whales?: boolean;
    early?: boolean;
    snipers?: boolean;
    kol?: boolean;
    riskyOnly?: boolean;
  }): Promise<TokenRow[]> {
    try {
      // For now, return mock data instead of making API calls
      // TODO: Replace with real API calls when backend is ready
      const mockTokens = ScannerMockData.generateTokens(50);
      
      // Apply filters to mock data
      let filteredTokens = mockTokens;
      
      if (filters?.whales) {
        filteredTokens = filteredTokens.filter(token => 
          token.tags?.includes("whale-in") || token.whaleInflow && token.whaleInflow > 100000
        );
      }
      
      if (filters?.early) {
        filteredTokens = filteredTokens.filter(token => 
          token.tags?.includes("early") || (token.age && token.age < 24)
        );
      }
      
      if (filters?.snipers) {
        filteredTokens = filteredTokens.filter(token => 
          token.tags?.includes("sniper")
        );
      }
      
      if (filters?.kol) {
        filteredTokens = filteredTokens.filter(token => 
          token.tags?.includes("kol")
        );
      }
      
      if (filters?.riskyOnly) {
        filteredTokens = filteredTokens.filter(token => 
          token.risk === "high" || token.flags?.bundled || token.flags?.devSold
        );
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return filteredTokens;
    } catch (error) {
      console.error("Error fetching tokens:", error)
      return []
    }
  }

  async getLiveFeed(): Promise<{ts: number, text: string}[]> {
    try {
      // Return mock live feed data
      // TODO: Replace with real WebSocket/API calls when backend is ready
      const mockFeed = ScannerMockData.generateLiveFeedEvents();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return mockFeed;
    } catch (error) {
      console.error("Error fetching live feed:", error)
      return []
    }
  }

  async getTrendingTokens(): Promise<{ rank: number; ticker: string; name: string; vol: number; change: number }[]> {
    try {
      // Return mock trending data
      const mockTrending = ScannerMockData.generateTrendingTokens();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockTrending;
    } catch (error) {
      console.error("Error fetching trending tokens:", error)
      return []
    }
  }
}

// Service instance ready for real data integration
const scannerService = ScannerService.getInstance();
export default scannerService;