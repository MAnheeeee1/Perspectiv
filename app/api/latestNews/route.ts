import { parseMarkdownNews } from "@/lib/parseMarkdownNews";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { targetPath } = (await request.json()) as { targetPath?: string };
  if (!targetPath) {
    return new Response(JSON.stringify({ error: "Missing targetPath" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const scrapeRes = await fetch(new URL("/api/scrapeWebsite", request.url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetPath }),
  });

  if (!scrapeRes.ok) {
    return new Response(
      JSON.stringify({ error: "Scrape request failed", details: await scrapeRes.text() }),
      { status: scrapeRes.status, headers: { "Content-Type": "application/json" } },
    );
  }

  const { scrapedData } = await scrapeRes.json();
  const data = parseMarkdownNews(scrapedData);

  return new Response(JSON.stringify({ data, scrapedData }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
