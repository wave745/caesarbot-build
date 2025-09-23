// Simple scanner service for mock data and fallback functionality
import { TokenRow, RiskLevel } from "@/stores/scanner";

export class SimpleScannerService {
  private static instance: SimpleScannerService;

  static getInstance(): SimpleScannerService {
    if (!SimpleScannerService.instance) {
      SimpleScannerService.instance = new SimpleScannerService();
    }
    return SimpleScannerService.instance;
  }

  // Simulate searching for a token
  async searchToken(contractAddress: string): Promise<TokenRow | null> {
    console.log(`[SimpleScannerService] Searching for token: ${contractAddress}`);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (contractAddress.startsWith("So11111111111111111111111111111111111111112")) { // Example for SOL
      return {
        ca: contractAddress,
        ticker: "SOL",
        name: "Solana",
        mc: 60000000000,
        price: 150.23,
        vol24h: 2500000000,
        lp: 1000000000,
        spark: this.generateMockSparkline(150.23),
        risk: "low",
        flags: { bundled: false, devSold: false, siteReused: false, dexUpdated: true },
        tags: ["whale-in", "early"],
        supply: 450000000,
        ath: 260.00,
        athTime: "2021-11-06T00:00:00Z",
        age: 20000,
        whaleInflow: 5000000
      };
    } else if (contractAddress.startsWith("EPjFWdd5AufqSSqeM2qN1xzybapT8G4wEGGkZwyTDt1v")) { // Example for USDC
      return {
        ca: contractAddress,
        ticker: "USDC",
        name: "USD Coin",
        mc: 33000000000,
        price: 1.00,
        vol24h: 5000000000,
        lp: 2000000000,
        spark: this.generateMockSparkline(1.00),
        risk: "low",
        flags: { bundled: false, devSold: false, siteReused: false, dexUpdated: true },
        tags: [],
        supply: 33000000000,
        ath: 1.01,
        athTime: "2022-05-12T00:00:00Z",
        age: 30000,
        whaleInflow: 10000000
      };
    }
    // Generic mock token
    return {
      ca: contractAddress,
      ticker: "MOCK",
      name: "Mock Token",
      mc: 1000000,
      price: 0.00123,
      vol24h: 50000,
      lp: 10000,
      spark: this.generateMockSparkline(0.00123),
      risk: "med",
      flags: { bundled: true, devSold: false, siteReused: true, dexUpdated: false },
      tags: ["early"],
      supply: 1000000000,
      ath: 0.005,
      athTime: "2023-10-26T14:30:00Z",
      age: 72,
      whaleInflow: 10000
    };
  }

  // Simulate executing a CaesarX command
  async executeCommand(command: string, contractAddress: string): Promise<any> {
    console.log(`[SimpleScannerService] Executing command: ${command} for ${contractAddress}`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    switch (command) {
      case 'whale_map':
        return {
          whales: [
            { address: "Whale1Address...", percentage: "15.23", amount: 152300000 },
            { address: "Whale2Address...", percentage: "10.10", amount: 101000000 },
            { address: "Whale3Address...", percentage: "5.50", amount: 55000000 },
          ]
        };
      case 'early_map':
        return {
          earlyBuyers: [
            { address: "EarlyBuyer1...", amount: 1000000, rank: 1 },
            { address: "EarlyBuyer2...", amount: 800000, rank: 2 },
          ]
        };
      case 'bundle':
        return {
          bundles: [
            { signature: "BundleTx1...", slot: 123456789, timestamp: new Date().toISOString() },
            { signature: "BundleTx2...", slot: 123456790, timestamp: new Date().toISOString() },
          ]
        };
      case 'th':
        return {
          totalHolders: 12345,
          holderDistribution: { top1: "15.23", top5: "30.50", top10: "45.70" },
          topHolders: [
            { address: "Holder1...", amount: 152300000 },
            { address: "Holder2...", amount: 101000000 },
          ]
        };
      case 'risk_score':
        return {
          riskLevel: "med",
          riskFactors: ["Low liquidity", "New token"],
          recommendations: ["Proceed with caution", "Monitor closely"]
        };
      default:
        return {
          command,
          contractAddress,
          data: {
            message: `Mock data for ${command} command. Real data integration pending.`,
            timestamp: new Date().toISOString()
          }
        };
    }
  }

  // Get available commands (same as SolanaScannerService for consistency)
  getAvailableCommands() {
    return [
      { key: "whale_map", label: "🐋 Whale Map", description: "Top whale holders" },
      { key: "early_map", label: "⚡ Early Buyers", description: "First buyers analysis" },
      { key: "bundle", label: "📦 Bundle Check", description: "Detect suspicious bundle transactions" },
      { key: "th", label: "👥 Top Holders", description: "Analyze holder concentration" },
      { key: "risk_score", label: "🚨 Risk Score", description: "Comprehensive risk assessment" },
    ];
  }

  private generateMockSparkline(basePrice: number): number[] {
    const points = 24;
    const data: number[] = [];
    let price = basePrice;
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * 0.05 * price; // +/- 5% volatility
      price += change;
      price = Math.max(price, basePrice * 0.8); // Don't go too low
      data.push(Number(price.toFixed(6)));
    }
    return data;
  }
}








