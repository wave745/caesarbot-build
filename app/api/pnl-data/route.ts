import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet') || 'YourWallet';
    const timeframe = searchParams.get('timeframe') || '24h';
    const ca = searchParams.get('ca');

    // If a specific token address is requested, fetch fresh data for that token from DexScreener
    if (ca) {
      const dsResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(ca)}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CaesarX/1.0' }
      });
      if (!dsResponse.ok) {
        return NextResponse.json({ success: false, error: `DexScreener error: ${dsResponse.status}` }, { status: 502 });
      }
      const dsData = await dsResponse.json();
      const pairs: any[] = Array.isArray(dsData.pairs) ? dsData.pairs : [];
      if (pairs.length === 0) {
        return NextResponse.json({ success: false, error: 'Token not found on DexScreener' }, { status: 404 });
      }
      // Choose the pair with highest 24h volume
      const bestPair = pairs.reduce((best, p) => {
        const vol = p?.volume?.h24 || 0;
        return vol > (best?.volume?.h24 || 0) ? p : best;
      }, pairs[0]);

      const price = parseFloat(bestPair?.priceUsd || 0);
      const changePct = parseFloat((bestPair?.priceChange?.h24 || 0));
      const volume24h = Math.floor(bestPair?.volume?.h24 || 0);
      const marketCap = Math.floor(bestPair?.marketCap || 0);
      const txnsObj = bestPair?.txns?.h24;
      const txns = typeof txnsObj === 'object' ? (txnsObj.buys || 0) + (txnsObj.sells || 0) : (txnsObj || 0);
      const buyTxns = typeof txnsObj === 'object' ? (txnsObj.buys || 0) : Math.floor(txns * 0.6);
      const holders = bestPair?.holders || 0;

      const entryPrice = changePct !== -100 ? (price / (1 + (changePct / 100))) : 0;
      const exitPrice = price;

      const pnlData = {
        tokenName: bestPair?.baseToken?.symbol || bestPair?.baseToken?.name || 'TOKEN',
        currentValue: parseFloat((price || 0).toFixed(6)),
        bought: buyTxns,
        holding: holders,
        pnl: changePct,
        pnlPercentage: changePct,
        entryPrice: entryPrice < 0.000001 ? entryPrice : parseFloat(entryPrice.toFixed(6)),
        exitPrice: exitPrice < 0.000001 ? exitPrice : parseFloat(exitPrice.toFixed(6)),
        wallet,
        timestamp: new Date().toISOString(),
        volume24h,
        marketCap,
        txns,
        logo: bestPair?.baseToken?.image || null,
        address: ca
      };

      return NextResponse.json({ success: true, data: pnlData });
    }

    // Fetch trending tokens data from our existing API (real data)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const trendingResponse = await fetch(`${baseUrl}/api/trending?timeframe=${timeframe}&limit=50`);
    
    if (!trendingResponse.ok) {
      throw new Error('Failed to fetch trending data');
    }

    const trendingData = await trendingResponse.json();
    if (!trendingData.success || !Array.isArray(trendingData.data) || trendingData.data.length === 0) {
      return NextResponse.json({ success: false, error: 'No trending data available' }, { status: 502 });
    }

    // Use the top token by volume from the trending list
    const token = trendingData.data[0];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Invalid token data' }, { status: 500 });
    }

    // Real values sourced from API mapping (DexScreener → our /api/trending format)
    const price = typeof token.price === 'number' ? token.price : 0;
    const changePct = typeof token.change === 'number' ? token.change : 0;
    const volume24h = typeof token.volume === 'number' ? token.volume : 0;
    const marketCap = typeof token.marketCap === 'number' ? token.marketCap : 0;
    const txns = typeof token.txns === 'number' ? token.txns : 0;
    const buyTxns = typeof token.buyTxns === 'number' ? token.buyTxns : 0;
    const holders = typeof token.holders === 'number' ? token.holders : 0;

    // Derive entry price from current price and percent change
    const entryPrice = changePct !== -100 ? price / (1 + (changePct / 100)) : 0;
    const exitPrice = price;

    const pnlData = {
      tokenName: token.symbol || token.name || 'TOKEN',
      currentValue: parseFloat((price || 0).toFixed(6)),
      bought: buyTxns,
      holding: holders,
      pnl: changePct,
      pnlPercentage: changePct,
      entryPrice: entryPrice < 0.000001 ? entryPrice : parseFloat(entryPrice.toFixed(6)),
      exitPrice: exitPrice < 0.000001 ? exitPrice : parseFloat(exitPrice.toFixed(6)),
      wallet,
      timestamp: new Date().toISOString(),
      // Additional data from the API
      volume24h,
      marketCap,
      txns,
      // Token metadata
      logo: token.image || null,
      address: token.ca || token.address || null
    };

    return NextResponse.json({
      success: true,
      data: pnlData
    });

  } catch (error) {
    console.error('Error fetching PnL data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch PnL data' }, { status: 502 });
  }
}
