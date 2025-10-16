import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Replace with real live feed data
    // For now, return empty array
    const liveFeed: any[] = [];
    
    return NextResponse.json(liveFeed);
  } catch (error) {
    console.error('Error in scanner live feed API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
