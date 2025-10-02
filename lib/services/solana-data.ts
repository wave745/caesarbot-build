// Real Solana data integration service using Jupiter, Helius Pro, DexScreener, and Moralis
import { MoralisService } from './moralis-service';

export class SolanaDataService {
  private static instance: SolanaDataService;
  private jupiterApiUrl = 'https://price.jup.ag/v4';
  private heliusRpcUrl = process.env.NEXT_PUBLIC_HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com';
  private dexScreenerUrl = 'https://api.dexscreener.com/latest';
  private moralisService: MoralisService;

  static getInstance(): SolanaDataService {
    if (!SolanaDataService.instance) {
      SolanaDataService.instance = new SolanaDataService();
    }
    return SolanaDataService.instance;
  }

  constructor() {
    this.moralisService = MoralisService.getInstance();
  }

  // Get enhanced token data with all sources
  async getEnhancedTokenData(mintAddress: string) {
    try {
      // Try Moralis first if available, then fallback to other sources
      let moralisData = null;
      if (this.moralisService.isAvailable()) {
        try {
          moralisData = await this.moralisService.getComprehensiveTokenData(mintAddress);
        } catch (error) {
          console.warn('Moralis API failed, falling back to other sources:', error);
        }
      }
      
      if (moralisData) {
        // Use Moralis data as primary source
        const [dexScreenerData, jupiterPrice] = await Promise.all([
          this.getTokenInfo(mintAddress),
          this.getTokenPrice(mintAddress)
        ]);

        return {
          ...moralisData,
          // Override with more accurate data from other sources if available
          price: dexScreenerData?.price || moralisData.price,
          priceChange24h: dexScreenerData?.priceChange24h || moralisData.priceChange24h,
          marketCap: dexScreenerData?.marketCap || moralisData.marketCap,
          volume24h: dexScreenerData?.volume24h || 0,
          liquidity: dexScreenerData?.liquidity || 0,
          sparkline: await this.generateRealSparklineData(mintAddress, moralisData.price),
          risk: this.calculateAdvancedRiskLevel(moralisData, dexScreenerData)
        };
      }

      // Fallback to original method if Moralis fails or is not available
      const [basicData, holders, transactions] = await Promise.all([
        this.getTokenData(mintAddress),
        this.getTokenHolders(mintAddress),
        this.getRecentTransactions(mintAddress)
      ]);

      if (!basicData) return null;

      return {
        ...basicData,
        holders: holders.topHolders || [],
        totalHolders: holders.totalHolders || 0,
        transactions: transactions.transactions || [],
        transactionCount: transactions.transactions?.length || 0,
        sparkline: this.generateSparklineData(basicData.price, 0.1),
        risk: this.calculateRiskLevel(basicData)
      };
    } catch (error) {
      console.error('Error getting enhanced token data:', error);
      return null;
    }
  }

  // Generate real sparkline data using historical price data
  async generateRealSparklineData(mintAddress: string, currentPrice: number): Promise<number[]> {
    try {
      // Try to get historical data from DexScreener
      const response = await fetch(`${this.dexScreenerUrl}/dex/tokens/${mintAddress}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        // Use price history if available, otherwise generate realistic data
        if (pair.priceHistory && pair.priceHistory.length > 0) {
          return pair.priceHistory.slice(-24).map((p: any) => parseFloat(p.value));
        }
      }
      
      // Fallback to generated data based on current price
      return this.generateSparklineData(currentPrice, 0.1);
    } catch (error) {
      console.error('Error generating real sparkline data:', error);
      return this.generateSparklineData(currentPrice, 0.1);
    }
  }

  // Calculate advanced risk level using multiple data sources
  calculateAdvancedRiskLevel(moralisData: any, dexScreenerData: any): "low" | "med" | "high" {
    let riskScore = 0;

    // Market cap risk
    const marketCap = dexScreenerData?.marketCap || moralisData.marketCap || 0;
    if (marketCap < 100000) riskScore += 3;
    else if (marketCap < 1000000) riskScore += 2;
    else if (marketCap < 10000000) riskScore += 1;

    // Volume risk
    const volume24h = dexScreenerData?.volume24h || 0;
    const volumeRatio = marketCap > 0 ? volume24h / marketCap : 0;
    if (volumeRatio < 0.01) riskScore += 2;
    else if (volumeRatio < 0.05) riskScore += 1;

    // Liquidity risk
    const liquidity = dexScreenerData?.liquidity || 0;
    const liquidityRatio = marketCap > 0 ? liquidity / marketCap : 0;
    if (liquidityRatio < 0.01) riskScore += 2;
    else if (liquidityRatio < 0.05) riskScore += 1;

    // Price volatility risk
    const priceChange24h = dexScreenerData?.priceChange24h || moralisData.priceChange24h || 0;
    const priceVolatility = Math.abs(priceChange24h);
    if (priceVolatility > 50) riskScore += 2;
    else if (priceVolatility > 20) riskScore += 1;

    // Holder concentration risk
    if (moralisData.holders && moralisData.holders.length > 0) {
      const topHolderPercentage = moralisData.holders[0]?.percentage || 0;
      if (topHolderPercentage > 50) riskScore += 3;
      else if (topHolderPercentage > 25) riskScore += 2;
      else if (topHolderPercentage > 10) riskScore += 1;
    }

    // Age risk
    const age = moralisData.age || 0;
    if (age < 24) riskScore += 2;
    else if (age < 168) riskScore += 1;

    // Transaction activity risk
    const txCount = moralisData.transactionCount || 0;
    if (txCount < 10) riskScore += 2;
    else if (txCount < 50) riskScore += 1;

    if (riskScore >= 6) return "high";
    if (riskScore >= 3) return "med";
    return "low";
  }

  // Basic token data methods
  async getTokenMetadata(mintAddress: string) {
    try {
      const response = await fetch(`${this.heliusRpcUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getAccountInfo',
          params: [mintAddress, { encoding: 'jsonParsed' }]
        })
      });
      return response.json();
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      return null;
    }
  }

  async getTokenPrice(mintAddress: string) {
    try {
      const response = await fetch(`${this.jupiterApiUrl}/price?ids=${mintAddress}`);
      const data = await response.json();
      return data.data?.[mintAddress]?.price || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  async getTokenFromJupiterList(mintAddress: string) {
    try {
      const response = await fetch('https://token.jup.ag/strict');
      const tokens = await response.json();
      const token = tokens.find((t: any) => t.address === mintAddress);
      return token ? {
        name: token.name,
        symbol: token.symbol,
        logo: token.logoURI,
        decimals: token.decimals
      } : null;
    } catch (error) {
      console.error('Error fetching token from Jupiter list:', error);
      return null;
    }
  }

  async getTokenInfo(mintAddress: string) {
    try {
      const response = await fetch(`${this.dexScreenerUrl}/dex/tokens/${mintAddress}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        return {
          price: parseFloat(pair.priceUsd) || 0,
          priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
          marketCap: parseFloat(pair.marketCap) || 0,
          volume24h: parseFloat(pair.volume?.h24) || 0,
          liquidity: parseFloat(pair.liquidity?.usd) || 0,
          dexId: pair.dexId,
          // Try to get token info from DexScreener
          name: pair.baseToken?.name,
          symbol: pair.baseToken?.symbol,
          logo: pair.baseToken?.image
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  async getTokenData(mintAddress: string) {
    try {
      const [price, info, metadata, jupiterToken] = await Promise.all([
        this.getTokenPrice(mintAddress),
        this.getTokenInfo(mintAddress),
        this.getTokenMetadata(mintAddress),
        this.getTokenFromJupiterList(mintAddress)
      ]);

      if (!info) return null;

      // Try to get token metadata from multiple sources
      let tokenName = `Token ${mintAddress.slice(0, 8)}`;
      let tokenSymbol = mintAddress.slice(0, 4).toUpperCase();
      let tokenLogo = null;
      let socialLinks = {};

      // First try Jupiter token list (most reliable for known tokens)
      if (jupiterToken) {
        tokenName = jupiterToken.name || tokenName;
        tokenSymbol = jupiterToken.symbol || tokenSymbol;
        tokenLogo = jupiterToken.logo || null;
      }

      // Then try DexScreener data
      if (info && (info.name || info.symbol)) {
        tokenName = info.name || tokenName;
        tokenSymbol = info.symbol || tokenSymbol;
        tokenLogo = info.logo || tokenLogo;
      }

      // Then try on-chain metadata
      if (metadata && metadata.result && metadata.result.value) {
        const accountData = metadata.result.value.data;
        if (accountData && accountData.parsed && accountData.parsed.info) {
          const tokenInfo = accountData.parsed.info;
          tokenName = tokenInfo.name || tokenName;
          tokenSymbol = tokenInfo.symbol || tokenSymbol;
          tokenLogo = tokenInfo.logo || tokenLogo;
          
          // Extract social links if available in metadata
          if (tokenInfo.uri) {
            try {
              const metadataResponse = await fetch(tokenInfo.uri);
              const metadataJson = await metadataResponse.json();
              if (metadataJson) {
                socialLinks = {
                  website: metadataJson.website || metadataJson.external_url,
                  twitter: metadataJson.twitter || metadataJson.twitter_url,
                  telegram: metadataJson.telegram || metadataJson.telegram_url,
                  discord: metadataJson.discord || metadataJson.discord_url,
                  github: metadataJson.github || metadataJson.github_url,
                  reddit: metadataJson.reddit || metadataJson.reddit_url,
                  instagram: metadataJson.instagram || metadataJson.instagram_url,
                  youtube: metadataJson.youtube || metadataJson.youtube_url,
                  tiktok: metadataJson.tiktok || metadataJson.tiktok_url,
                  twitch: metadataJson.twitch || metadataJson.twitch_url,
                  facebook: metadataJson.facebook || metadataJson.facebook_url
                };
              }
            } catch (error) {
              console.warn('Could not fetch token metadata URI:', error);
            }
          }
        }
      }

      // Calculate token age from first transaction
      const age = await this.getTokenAge(mintAddress);

      return {
        mint: mintAddress,
        name: tokenName,
        symbol: tokenSymbol,
        logo: tokenLogo,
        price: price || info.price,
        priceChange24h: info.priceChange24h,
        marketCap: info.marketCap,
        volume24h: info.volume24h,
        liquidity: info.liquidity,
        supply: 1000000000, // Default supply
        decimals: 9,
        age: age,
        community: this.formatCommunityInfo(age, mintAddress),
        // Social links
        ...socialLinks
      };
    } catch (error) {
      console.error('Error getting token data:', error);
      return null;
    }
  }

  generateSparklineData(basePrice: number, volatility: number): number[] {
    const points = 24;
    const data: number[] = [];
    let price = basePrice;
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * volatility * price;
      price += change;
      price = Math.max(price, basePrice * 0.5); // Don't go too low
      data.push(Number(price.toFixed(6)));
    }
    return data;
  }

  calculateRiskLevel(data: any): "low" | "med" | "high" {
    let riskScore = 0;
    
    if (data.marketCap < 100000) riskScore += 3;
    else if (data.marketCap < 1000000) riskScore += 2;
    else if (data.marketCap < 10000000) riskScore += 1;
    
    if (data.volume24h < 1000) riskScore += 2;
    else if (data.volume24h < 10000) riskScore += 1;
    
    if (data.liquidity < 10000) riskScore += 2;
    else if (data.liquidity < 50000) riskScore += 1;
    
    if (Math.abs(data.priceChange24h) > 50) riskScore += 2;
    else if (Math.abs(data.priceChange24h) > 20) riskScore += 1;
    
    if (riskScore >= 6) return "high";
    if (riskScore >= 3) return "med";
    return "low";
  }

  isValidSolanaAddress(address: string): boolean {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }

  async getRecentTransactions(mintAddress: string) {
    try {
      const response = await fetch(`${this.heliusRpcUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [mintAddress, { limit: 10 }]
        })
      });
      const data = await response.json();
      return {
        transactions: data.result || [],
        transactionCount: data.result?.length || 0
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { transactions: [], transactionCount: 0 };
    }
  }

  async getTokenHolders(mintAddress: string) {
    try {
      const response = await fetch(`${this.heliusRpcUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByMint',
          params: [mintAddress, { encoding: 'jsonParsed' }]
        })
      });
      const data = await response.json();
      
      const holders = data.result?.value?.slice(0, 10).map((account: any, index: number) => ({
        address: account.owner,
        amount: parseFloat(account.account.data.parsed.info.tokenAmount.uiAmountString),
        percentage: Math.random() * 20 // Mock percentage
      })) || [];
      
      return {
        topHolders: holders,
        totalHolders: data.result?.value?.length || 0
      };
    } catch (error) {
      console.error('Error fetching holders:', error);
      return { topHolders: [], totalHolders: 0 };
    }
  }

  // Get token age in hours
  async getTokenAge(mintAddress: string): Promise<number> {
    try {
      const response = await fetch(`${this.heliusRpcUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [mintAddress, { limit: 1 }]
        })
      });
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        const firstTx = data.result[data.result.length - 1]; // Get oldest transaction
        const txTime = firstTx.blockTime * 1000; // Convert to milliseconds
        const now = Date.now();
        const ageInHours = Math.floor((now - txTime) / (1000 * 60 * 60));
        return ageInHours;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching token age:', error);
      return 0;
    }
  }

  // Format community info with age and shortened address
  formatCommunityInfo(ageInHours: number, mintAddress: string): string {
    let ageText = '';
    if (ageInHours < 24) {
      ageText = `${ageInHours}h`;
    } else if (ageInHours < 168) { // 7 days
      ageText = `${Math.floor(ageInHours / 24)}d`;
    } else if (ageInHours < 720) { // 30 days
      ageText = `${Math.floor(ageInHours / 168)}w`;
    } else {
      ageText = `${Math.floor(ageInHours / 720)}m`;
    }
    
    const shortenedAddress = `${mintAddress.slice(0, 4)}...${mintAddress.slice(-4)}`;
    return `${ageText} ${shortenedAddress}`;
  }
}











