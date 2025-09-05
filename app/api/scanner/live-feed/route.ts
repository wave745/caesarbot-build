import { NextResponse } from 'next/server';
import { ScannerMockData } from '@/lib/mock-data/scanner-mock-data';

export async function GET() {
  try {
    // Generate mock live feed data
    const mockFeed = ScannerMockData.generateLiveFeedEvents();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json(mockFeed);
  } catch (error) {
    console.error('Error in scanner live feed API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
