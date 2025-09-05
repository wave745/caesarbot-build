import { NextRequest, NextResponse } from 'next/server';
import { SniperMockData } from '@/lib/mock-data/sniper-mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    // Generate mock wallet stats
    const mockStats = SniperMockData.generateTargetWalletStats(address);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Error in wallet stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
