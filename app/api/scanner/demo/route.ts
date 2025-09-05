import { NextRequest, NextResponse } from 'next/server';
import { demoTokens } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get filter parameters
  const group = searchParams.get('group');
  const whales = searchParams.get('whales') === 'true';
  const early = searchParams.get('early') === 'true';
  const snipers = searchParams.get('snipers') === 'true';
  const kol = searchParams.get('kol') === 'true';
  const riskyOnly = searchParams.get('riskyOnly') === 'true';
  
  let filteredTokens = [...demoTokens];
  
  // Apply filters
  if (riskyOnly) {
    filteredTokens = filteredTokens.filter(t => t.risk === "high");
  }
  
  if (whales) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("whale-in") || (t.whaleInflow && t.whaleInflow > 200000));
  }
  
  if (early) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("early"));
  }
  
  if (snipers) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("sniper"));
  }
  
  if (kol) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("kol"));
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(filteredTokens);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Handle POST requests with filter body
  const { filters } = body;
  
  let filteredTokens = [...demoTokens];
  
  if (filters?.riskyOnly) {
    filteredTokens = filteredTokens.filter(t => t.risk === "high");
  }
  
  if (filters?.whales) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("whale-in") || (t.whaleInflow && t.whaleInflow > 200000));
  }
  
  if (filters?.early) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("early"));
  }
  
  if (filters?.snipers) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("sniper"));
  }
  
  if (filters?.kol) {
    filteredTokens = filteredTokens.filter(t => t.tags?.includes("kol"));
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(filteredTokens);
}
