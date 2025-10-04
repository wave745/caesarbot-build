import { NextRequest, NextResponse } from "next/server";
import { GrokService, ChatMessage, MetaContext } from "@/lib/services/grok-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, metaContext, stream } = body as {
      messages: ChatMessage[];
      metaContext?: MetaContext;
      stream?: boolean;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    if (stream) {
      const readableStream = await GrokService.streamChat(messages, metaContext);
      
      return new NextResponse(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    const response = await GrokService.chat(messages, metaContext);
    
    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Grok chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process chat" },
      { status: 500 }
    );
  }
}
