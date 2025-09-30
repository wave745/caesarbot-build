import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty array until real API integration is implemented
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error in wallets API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
