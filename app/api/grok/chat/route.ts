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
      const grokStream = await GrokService.streamChat(messages, metaContext);
      
      const transformedStream = new ReadableStream({
        async start(controller) {
          const reader = grokStream.getReader();
          const decoder = new TextDecoder();
          
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const text = decoder.decode(value, { stream: true });
              const sseMessage = `data: ${JSON.stringify({ content: text })}\n\n`;
              controller.enqueue(new TextEncoder().encode(sseMessage));
            }
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });
      
      return new NextResponse(transformedStream, {
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
