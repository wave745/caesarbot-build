import { TokenRow } from "@/stores/scanner";

// Service layer for scanner data
export class ScannerService {
  private static instance: ScannerService

  static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  async searchToken(query: string): Promise<TokenRow[]> {
    try {
      // Make API call to search for token
      const response = await fetch('/api/scanner/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to search token');
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error("Error searching token:", error);
      return [];
    }
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
      // Make API call to get tokens with filters
      const response = await fetch('/api/scanner/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters || {}),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error("Error fetching tokens:", error);
      return [];
    }
  }
}

// Service instance ready for real data integration
const scannerService = ScannerService.getInstance();
export default scannerService;