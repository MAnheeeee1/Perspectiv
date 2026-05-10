import { extractNewsFromContent } from "@/lib/extract";
import { scrapeUrl } from "@/lib/scrape";

export const runtime = "nodejs";

const DEFAULT_SOURCES = [
  "https://www.svd.se",
  "https://omni.se",
  "https://www.dn.se",
  "https://www.aftonbladet.se",
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sources: string[] = Array.isArray(body.sources)
    ? body.sources
    : DEFAULT_SOURCES;

  const results = await Promise.allSettled(
    sources.map(async (url) => {
      const content = await scrapeUrl(url);
      const extracted = await extractNewsFromContent(content);
      return extracted;
    }),
  );

  const succeeded: unknown[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      succeeded.push(result.value);
    } else {
      errors.push(`${sources[i]}: ${String(result.reason)}`);
    }
  }

  return Response.json({ results: succeeded, errors });
}
