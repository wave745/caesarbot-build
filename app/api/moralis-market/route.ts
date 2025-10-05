import { NextRequest, NextResponse } from 'next/server';

const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'topTokens';

    if (!MORALIS_API_KEY) {
      return NextResponse.json({ error: 'Moralis API key not configured' }, { status: 500 });
    }

    const baseUrl = 'https://deep-index.moralis.io/api/v2.2';

    if (action === 'topTokens') {
      // Get top ERC20 tokens by market cap
      const response = await fetch(`${baseUrl}/market-data/erc20s/top-tokens`, {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: data.result || []
      });

    } else if (action === 'topGainers') {
      // Get top gainers
      const timeFrame = searchParams.get('timeFrame') || '1d';
      const minMarketCap = searchParams.get('minMarketCap') || '50000000';
      const securityScore = searchParams.get('securityScore') || '80';

      const response = await fetch(`${baseUrl}/discovery/tokens/top-gainers?chain=eth&time_frame=${timeFrame}&min_market_cap=${minMarketCap}&security_score=${securityScore}`, {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: data.result || []
      });

    } else if (action === 'searchTokens') {
      // Search for specific tokens
      const query = searchParams.get('q') || '';
      
      if (!query) {
        return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
      }

      const response = await fetch(`${baseUrl}/tokens/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: data.result || []
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error in Moralis Market API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }, 
      { status: 500 }
    );
  }
}

