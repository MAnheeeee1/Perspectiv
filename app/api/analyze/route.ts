import { readFile } from "node:fs/promises";
import { join } from "node:path";

import OpenAI from "openai";

import { scrapeUrl } from "@/lib/scrape";

export const runtime = "nodejs";

interface AnalyzeBody {
  url?: string;
  title?: string;
  content?: string;
  source?: string;
}

const PAYWALL_THRESHOLD = 800;

function extractJsonText(message: string): string {
  const fencedMatch = message.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  return message.trim();
}

export async function POST(request: Request) {
  const body = (await request.json()) as AnalyzeBody;

  let textToAnalyze: string;
  let limitedContent = false;

  if (body.url) {
    const scraped = await scrapeUrl(body.url);
    if (!scraped) {
      return Response.json({ error: "Failed to scrape URL" }, { status: 502 });
    }
    textToAnalyze = scraped;
    if (textToAnalyze.length < PAYWALL_THRESHOLD) {
      limitedContent = true;
    }
    if (body.title) {
      textToAnalyze = `# ${body.title}\n\n${textToAnalyze}`;
    }
  } else if (body.content) {
    textToAnalyze = body.title
      ? `# ${body.title}\n\n${body.content}`
      : body.content;
    if (body.content.length < PAYWALL_THRESHOLD) {
      limitedContent = true;
    }
  } else {
    return Response.json(
      { error: "Provide either url or content" },
      { status: 400 },
    );
  }

  const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  const systemPrompt = await readFile(
    join(process.cwd(), "analyzeAgent.md"),
    "utf8",
  );

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: textToAnalyze },
    ],
    model: "deepseek-chat",
    max_tokens: 1800,
    temperature: 0.2,
  });

  const message = completion.choices[0]?.message?.content ?? "";

  let analysis: unknown;
  try {
    analysis = JSON.parse(extractJsonText(message));
  } catch {
    return Response.json(
      { error: "Model returned invalid JSON", raw: message },
      { status: 502 },
    );
  }

  return Response.json({ analysis, limitedContent });
}
