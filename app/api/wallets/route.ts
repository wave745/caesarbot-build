import { NextResponse } from 'next/server';
import { SniperMockData } from '@/lib/mock-data/sniper-mock-data';

export async function GET() {
  try {
    // Generate mock wallets data
    const mockWallets = SniperMockData.generateWallets(5);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return NextResponse.json(mockWallets);
  } catch (error) {
    console.error('Error in wallets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
