import { NextRequest, NextResponse } from 'next/server';
import { ScannerMockData } from '@/lib/mock-data/scanner-mock-data';

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();
    
    // Generate mock tokens
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
    
    return NextResponse.json(filteredTokens);
  } catch (error) {
    console.error('Error in scanner tokens API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
