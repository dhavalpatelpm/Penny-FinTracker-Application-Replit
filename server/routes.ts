import type { Express } from "express";
import { createServer, type Server } from "node:http";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/ai/insights", async (req, res) => {
    try {
      const { transactions, period, question, profile } = req.body;

      const currencySymbol = profile?.currency?.symbol || "$";
      const currencyCode = profile?.currency?.code || "USD";
      const userName = profile?.name || "there";

      const txSummary = transactions && transactions.length > 0
        ? transactions.map((t: Record<string, unknown>) =>
            `${t.type}: ${currencySymbol}${t.amount} - ${t.categoryId} (${t.note || 'no note'}) on ${t.date}`
          ).join('\n')
        : "No transactions this period.";

      const systemPrompt = `You are Penny, a friendly and smart personal finance assistant. 
You help users understand their spending habits and make better financial decisions.
Keep responses concise, warm, and actionable. Use bullet points when listing multiple items.
The user's currency is ${currencyCode} (${currencySymbol}).
Never use markdown headers (##). Use plain text with bullet points (•) only.`;

      const userMessage = question
        ? `Here are my transactions for ${period}:\n${txSummary}\n\nMy question: ${question}`
        : `Here are my transactions for ${period}:\n${txSummary}\n\nPlease give me a brief, friendly analysis of my spending. What are my top expenses? Any patterns you notice? One or two actionable tips?`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          const text = event.delta.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("AI insights error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to generate insights" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate insights" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
