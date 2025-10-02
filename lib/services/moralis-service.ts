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
    return this.fetchMoralis(`/token/mainnet/${address}/metadata`);
  }

  async getTokenPrice(address: string) {
    return this.fetchMoralis(`/token/mainnet/${address}/price`);
  }

  async getTokenInfo(address: string) {
    return this.fetchMoralis(`/token/mainnet/${address}`);
  }

  async getTokenHolders(address: string) {
    return this.fetchMoralis(`/token/mainnet/${address}/holders`);
  }

  async getTokenTransactions(address: string) {
    return this.fetchMoralis(`/token/mainnet/${address}/transfers`);
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
      console.log('Fetching comprehensive token data from Moralis for:', mintAddress);
      
      const [metadata, priceData, holdersData, transactionsData, tokenInfo] = await Promise.all([
        this.getTokenMetadata(mintAddress).catch(e => { console.error("Moralis metadata failed:", e); return null; }),
        this.getTokenPrice(mintAddress).catch(e => { console.error("Moralis price failed:", e); return null; }),
        this.getTokenHolders(mintAddress).catch(e => { console.error("Moralis holders failed:", e); return null; }),
        this.getTokenTransactions(mintAddress).catch(e => { console.error("Moralis transactions failed:", e); return null; }),
        this.getTokenInfo(mintAddress).catch(e => { console.error("Moralis token info failed:", e); return null; }),
      ]);

      console.log('Moralis data received:', { metadata, priceData, holdersData, transactionsData, tokenInfo });
      console.log('Token metadata details:', {
        name: metadata?.name,
        symbol: metadata?.symbol,
        logo: metadata?.logo,
        image: metadata?.image,
        uri: metadata?.uri
      });

      // Use tokenInfo as fallback if metadata is not available
      const primaryData = metadata || tokenInfo;
      if (!primaryData) return null;

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
      
      // Format community info
      const formatCommunityInfo = (ageInHours: number, mintAddress: string): string => {
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
      };

      // Extract social links from metadata if available
      let socialLinks = {};
      if (metadata.uri) {
        try {
          const metadataResponse = await fetch(metadata.uri);
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
          console.warn('Could not fetch token metadata URI from Moralis:', error);
        }
      }

      return {
        mint: mintAddress,
        name: primaryData.name,
        symbol: primaryData.symbol,
        decimals: primaryData.decimals,
        logo: primaryData.logo || primaryData.image,
        supply: parseFloat(primaryData.supply),
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
        community: formatCommunityInfo(age, mintAddress),
        risk: "low", 
        sparkline: [],
        // Social links
        ...socialLinks
      };
    } catch (error) {
      console.error('Error getting comprehensive token data from Moralis:', error);
      return null;
    }
  }
}











