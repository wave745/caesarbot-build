import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MetaContext {
  topMetas: Array<{
    word: string;
    score: number;
    word_with_strength: string;
  }>;
  totalMetas: number;
  averageScore: number;
}

export class GrokService {
  static async chat(messages: ChatMessage[], metaContext?: MetaContext): Promise<string> {
    try {
      const systemPrompt = metaContext
        ? `You are an expert Solana memecoin launch strategist and creative advisor. You analyze current market metas and provide actionable insights for token launches.

CURRENT META DATA:
- Top Metas: ${metaContext.topMetas.map(m => `${m.word} (score: ${m.score})`).join(", ")}
- Total Active Metas: ${metaContext.totalMetas}
- Average Meta Score: ${metaContext.averageScore}

Your role is to:
1. Analyze current meta trends and provide strategic insights
2. Suggest creative ticker ideas with compelling names, descriptions, and lore
3. Help traders identify opportunities based on trending metas
4. Provide professional, actionable advice for memecoin launches

Always be creative, insightful, and consider market psychology. When suggesting tickers, include:
- Ticker symbol (uppercase, catchy, 3-6 characters)
- Full name
- Brief description
- Engaging lore/backstory
- Why it fits the current meta

Keep responses concise but valuable. Use trader-friendly language.`
        : `You are an expert Solana memecoin launch strategist. Help traders with creative ideas and strategic insights for token launches.`;

      const response = await openai.chat.completions.create({
        model: "grok-2-1212",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error("Grok API error:", error);
      throw new Error("Failed to get AI response. Please try again.");
    }
  }

  static async streamChat(messages: ChatMessage[], metaContext?: MetaContext): Promise<ReadableStream> {
    const systemPrompt = metaContext
      ? `You are an expert Solana memecoin launch strategist and creative advisor. You analyze current market metas and provide actionable insights for token launches.

CURRENT META DATA:
- Top Metas: ${metaContext.topMetas.map(m => `${m.word} (score: ${m.score})`).join(", ")}
- Total Active Metas: ${metaContext.totalMetas}
- Average Meta Score: ${metaContext.averageScore}

Your role is to:
1. Analyze current meta trends and provide strategic insights
2. Suggest creative ticker ideas with compelling names, descriptions, and lore
3. Help traders identify opportunities based on trending metas
4. Provide professional, actionable advice for memecoin launches

Always be creative, insightful, and consider market psychology. When suggesting tickers, include:
- Ticker symbol (uppercase, catchy, 3-6 characters)
- Full name
- Brief description
- Engaging lore/backstory
- Why it fits the current meta

Keep responses concise but valuable. Use trader-friendly language.`
      : `You are an expert Solana memecoin launch strategist. Help traders with creative ideas and strategic insights for token launches.`;

    const stream = await openai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 1000,
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });
  }
}
