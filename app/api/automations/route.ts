import { NextResponse } from 'next/server';
import { SniperMockData } from '@/lib/mock-data/sniper-mock-data';

export async function GET() {
  try {
    // Generate mock automations data
    const mockAutomations = SniperMockData.generateAutomations(8);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return NextResponse.json(mockAutomations);
  } catch (error) {
    console.error('Error in automations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const automation = await request.json();
    
    // For mock purposes, just return the automation with generated ID
    const newAutomation = {
      ...automation,
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now()
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(newAutomation, { status: 201 });
  } catch (error) {
    console.error('Error creating automation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
