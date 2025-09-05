import { NextResponse } from 'next/server';
import { ScannerMockData } from '@/lib/mock-data/scanner-mock-data';

export async function GET() {
  try {
    // Generate mock trending data
    const mockTrending = ScannerMockData.generateTrendingTokens();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json(mockTrending);
  } catch (error) {
    console.error('Error in scanner trending API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
