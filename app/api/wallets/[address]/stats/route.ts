import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    
    // Return error until real API integration is implemented
    return NextResponse.json({ error: 'Wallet stats not yet implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error in wallet stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
