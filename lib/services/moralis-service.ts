// Moralis API service for Solana blockchain data
export class MoralisService {
  private static instance: MoralisService;
  private apiKey: string;
  private baseUrl = 'https://solana-gateway.moralis.io';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Moralis API key not found. Some features may not work.');
    }
  }

  // Check if Moralis is available
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  static getInstance(): MoralisService {
    if (!MoralisService.instance) {
      MoralisService.instance = new MoralisService();
    }
    return MoralisService.instance;
  }

  private async fetchMoralis(endpoint: string, params?: Record<string, any>) {
    if (!this.isAvailable()) {
      throw new Error('Moralis API key is not configured.');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Moralis API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async getTokenMetadata(address: string) {
    return this.fetchMoralis(`/token/${address}/metadata`);
  }

  async getTokenPrice(address: string) {
    return this.fetchMoralis(`/token/${address}/price`);
  }

  async getTokenHolders(address: string) {
    return this.fetchMoralis(`/token/${address}/holders`);
  }

  async getTokenTransactions(address: string) {
    return this.fetchMoralis(`/token/${address}/transfers`);
  }

  async getWalletTokenBalances(address: string) {
    return this.fetchMoralis(`/account/${address}/tokens`);
  }

  async getWalletNFTs(address: string) {
    return this.fetchMoralis(`/account/${address}/nft`);
  }

  async getWalletTransactions(address: string) {
    return this.fetchMoralis(`/account/${address}/transactions`);
  }

  async getComprehensiveTokenData(mintAddress: string) {
    try {
      const [metadata, priceData, holdersData, transactionsData] = await Promise.all([
        this.getTokenMetadata(mintAddress).catch(e => { console.error("Moralis metadata failed:", e); return null; }),
        this.getTokenPrice(mintAddress).catch(e => { console.error("Moralis price failed:", e); return null; }),
        this.getTokenHolders(mintAddress).catch(e => { console.error("Moralis holders failed:", e); return null; }),
        this.getTokenTransactions(mintAddress).catch(e => { console.error("Moralis transactions failed:", e); return null; }),
      ]);

      if (!metadata) return null;

      const totalHolders = holdersData?.total || 0;
      const topHolders = holdersData?.result?.map((h: any) => ({
        address: h.owner_address,
        amount: parseFloat(h.amount),
        percentage: parseFloat(h.percentage)
      })) || [];

      const transactions = transactionsData?.result?.map((tx: any) => ({
        signature: tx.signature,
        blockNumber: tx.block_number,
        blockTimestamp: tx.block_timestamp,
        fromAddress: tx.from_address,
        toAddress: tx.to_address,
        amount: parseFloat(tx.amount),
        type: tx.type
      })) || [];

      const age = metadata.created_at ? Math.floor((Date.now() - new Date(metadata.created_at).getTime()) / 3600000) : 0;

      return {
        mint: mintAddress,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        logo: metadata.logo,
        supply: parseFloat(metadata.supply),
        price: priceData?.usdPrice || 0,
        priceChange24h: priceData?.usdPrice24hrPercentageChange || 0,
        marketCap: priceData?.marketCap || 0,
        volume24h: priceData?.volume24hr || 0,
        liquidity: priceData?.liquidity || 0,
        fdv: priceData?.fullyDilutedValuation || 0,
        holders: topHolders,
        totalHolders: totalHolders,
        transactions: transactions,
        transactionCount: transactions.length,
        age: age,
        risk: "low", 
        sparkline: []
      };
    } catch (error) {
      console.error('Error getting comprehensive token data from Moralis:', error);
      return null;
    }
  }
}








