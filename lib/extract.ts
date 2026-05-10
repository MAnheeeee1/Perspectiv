import { readFile } from "node:fs/promises";
import { join } from "node:path";

import OpenAI from "openai";

function extractJsonText(message: string): string {
  const fencedMatch = message.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();
  return message.trim();
}

export async function extractNewsFromContent(content: string): Promise<unknown> {
  const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  const systemPrompt = await readFile(
    join(process.cwd(), "extractionAgent.md"),
    "utf8",
  );

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    model: "deepseek-chat",
    max_tokens: 4096,
    temperature: 0,
  });

  const message = completion.choices[0]?.message?.content ?? "";
  return JSON.parse(extractJsonText(message));
}
