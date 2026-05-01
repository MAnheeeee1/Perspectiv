import { readFile } from "node:fs/promises";
import { join } from "node:path";

import OpenAI from "openai";

export const runtime = "nodejs";

async function loadSystemPrompt() {
  const promptPath = join(process.cwd(), "extractionAgent.md");
  return readFile(promptPath, "utf8");
}

function extractJsonText(message: string) {
  const fencedMatch = message.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  return message.trim();
}

function looksTruncated(message: string) {
  const trimmed = message.trim();
  return trimmed.length > 0 && !/[}\]]\s*$/.test(trimmed);
}

export async function POST(request: Request) {
  const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  const { targetPath } = (await request.json()) as { targetPath?: string };
  if (!targetPath) {
    return new Response(JSON.stringify({ error: "Missing targetPath" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch(new URL("/api/scrapeWebsite", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetPath }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return new Response(
      JSON.stringify({
        error: "Scrape request failed",
        details: errorBody,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { scrapedData: crawledContent } = await response.json();
  const systemPrompt = await loadSystemPrompt();
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: crawledContent },
    ],
    model: "deepseek-chat",
    max_tokens: 4096,
    temperature: 0,
  });

  const message = completion.choices[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonText(message));
  } catch {
    return new Response(
      JSON.stringify({
        error: "Model did not return valid JSON",
        truncated: looksTruncated(message),
        rawMessage: message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ data: parsed, scrapedData: crawledContent }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
