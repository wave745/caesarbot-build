import { NextRequest, NextResponse } from 'next/server';
import { demoTokens } from '@/lib/demo-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { ca: string } }
) {
  const { ca } = params;
  
  // Find token by CA
  const token = demoTokens.find(t => t.ca === ca);
  
  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Return full token details (same as the token object for now)
  return NextResponse.json(token);
}
