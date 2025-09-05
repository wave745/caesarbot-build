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

  async getTokens(filters?: {
    group?: string;
    whales?: boolean;
    early?: boolean;
    snipers?: boolean;
    kol?: boolean;
    riskyOnly?: boolean;
  }): Promise<TokenRow[]> {
    try {
      const response = await fetch('/api/scanner/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error("Error fetching tokens:", error)
      return []
    }
  }

  async getLiveFeed(): Promise<{ts: number, text: string}[]> {
    try {
      const response = await fetch('/api/scanner/live-feed')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch live feed: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error("Error fetching live feed:", error)
      return []
    }
  }
}

// Service instance ready for real data integration
const scannerService = ScannerService.getInstance();
export default scannerService;