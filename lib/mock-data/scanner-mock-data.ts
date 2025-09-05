import { TokenRow, RiskLevel } from "@/stores/scanner";

// Mock token data generator
export class ScannerMockData {
  private static tokenNames = [
    "DogeCoin", "ShibaInu", "PepeCoin", "Floki", "Bonk", "Wif", "Myro", "Popcat",
    "Bome", "Meme", "Trump", "Biden", "Elon", "Musk", "Tesla", "SpaceX",
    "Bitcoin", "Ethereum", "Solana", "Cardano", "Polkadot", "Chainlink", "Uniswap",
    "PancakeSwap", "SushiSwap", "Aave", "Compound", "Maker", "Yearn", "Curve"
  ];

  private static tickers = [
    "DOGE", "SHIB", "PEPE", "FLOKI", "BONK", "WIF", "MYRO", "POPCAT",
    "BOME", "MEME", "TRUMP", "BIDEN", "ELON", "MUSK", "TSLA", "SPACE",
    "BTC", "ETH", "SOL", "ADA", "DOT", "LINK", "UNI", "CAKE",
    "SUSHI", "AAVE", "COMP", "MKR", "YFI", "CRV"
  ];

  private static riskLevels: RiskLevel[] = ["low", "med", "high"];

  private static generateSparkline(): number[] {
    const points = 24; // 24 hours of data
    const basePrice = Math.random() * 0.01 + 0.001; // Base price between 0.001-0.011
    const sparkline: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const volatility = (Math.random() - 0.5) * 0.3; // ±15% volatility
      const price = basePrice * (1 + volatility);
      sparkline.push(Math.max(0.0001, price)); // Ensure positive price
    }
    
    return sparkline;
  }

  private static generateContractAddress(): string {
    const chars = "0123456789abcdef";
    let result = "0x";
    for (let i = 0; i < 40; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private static generateTags(): ("whale-in"|"early"|"sniper"|"kol")[] {
    const allTags: ("whale-in"|"early"|"sniper"|"kol")[] = ["whale-in", "early", "sniper", "kol"];
    const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  }

  private static generateFlags() {
    return {
      bundled: Math.random() > 0.7,
      devSold: Math.random() > 0.8,
      siteReused: Math.random() > 0.9,
      dexUpdated: Math.random() > 0.6
    };
  }

  static generateToken(): TokenRow {
    const nameIndex = Math.floor(Math.random() * this.tokenNames.length);
    const name = this.tokenNames[nameIndex];
    const ticker = this.tickers[nameIndex] || name.substring(0, 4).toUpperCase();
    
    const marketCap = Math.random() * 10000000 + 100000; // 100K - 10M
    const price = marketCap / (Math.random() * 1000000000 + 1000000); // Based on supply
    const volume24h = marketCap * (Math.random() * 0.5 + 0.1); // 10-60% of market cap
    const liquidity = marketCap * (Math.random() * 0.3 + 0.05); // 5-35% of market cap
    
    const risk = this.riskLevels[Math.floor(Math.random() * this.riskLevels.length)];
    const sparkline = this.generateSparkline();
    const tags = this.generateTags();
    const flags = this.generateFlags();
    
    return {
      ca: this.generateContractAddress(),
      ticker,
      name,
      mc: Math.round(marketCap),
      price: Number(price.toFixed(8)),
      vol24h: Math.round(volume24h),
      lp: Math.round(liquidity),
      spark: sparkline,
      risk,
      flags,
      tags,
      supply: Math.floor(Math.random() * 1000000000) + 1000000,
      ath: price * (Math.random() * 5 + 1), // 1-6x current price
      athTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      age: Math.floor(Math.random() * 168) + 1, // 1-168 hours (1 week)
      whaleInflow: Math.random() * 1000000 + 10000 // 10K - 1M
    };
  }

  static generateTokens(count: number = 50): TokenRow[] {
    return Array.from({ length: count }, () => this.generateToken());
  }

  static generateLiveFeedEvents(): {ts: number, text: string}[] {
    const events = [
      "🐳 Whale alert: 1.2M $PEPE bought",
      "⚡ Early buyer detected: 500K $BONK",
      "🎯 Sniper activity: 2.1M $WIF",
      "👑 KOL activity: @elonmusk mentioned $DOGE",
      "🧨 High risk token detected: $SCAM",
      "📈 Volume spike: $SHIB +300%",
      "🔒 Security alert: Dev sold 50%",
      "🌊 Liquidity added: $FLOKI +2M",
      "📊 New token listed: $MYRO",
      "💎 Diamond hands: $BOME holder",
      "🚀 Pump detected: $POPCAT +500%",
      "📉 Dump detected: $MEME -80%",
      "🔄 Bundle detected: 3 transactions",
      "🎪 Launchpad alert: New token",
      "⚡ Flash loan detected: $AAVE",
      "🔍 Duplicate token found: $FAKE",
      "📱 Social media buzz: $TRUMP trending",
      "🎯 MEV bot detected: $UNI",
      "🐋 Whale exit: 5M $SOL sold",
      "💫 New ATH: $BONK breaks record"
    ];

    const now = Date.now();
    return events.map((event, index) => ({
      ts: now - (index * 30000), // 30 seconds apart
      text: event
    }));
  }

  static generateTrendingTokens(): { rank: number; ticker: string; name: string; vol: number; change: number }[] {
    return [
      { rank: 1, ticker: "BONK", name: "Bonk", vol: 2500000, change: 45.2 },
      { rank: 2, ticker: "WIF", name: "Dogwifhat", vol: 1800000, change: 32.1 },
      { rank: 3, ticker: "PEPE", name: "Pepe", vol: 1500000, change: 28.7 },
      { rank: 4, ticker: "FLOKI", name: "Floki", vol: 1200000, change: 22.3 },
      { rank: 5, ticker: "MYRO", name: "Myro", vol: 950000, change: 18.9 },
      { rank: 6, ticker: "POPCAT", name: "Popcat", vol: 800000, change: 15.4 },
      { rank: 7, ticker: "BOME", name: "Book of Meme", vol: 700000, change: 12.8 },
      { rank: 8, ticker: "MEME", name: "Memecoin", vol: 600000, change: 9.2 },
      { rank: 9, ticker: "TRUMP", name: "Trump", vol: 500000, change: 7.1 },
      { rank: 10, ticker: "ELON", name: "Elon", vol: 400000, change: 5.3 }
    ];
  }
}
