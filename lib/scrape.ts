export async function scrapeUrl(url: string): Promise<string> {
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY is not defined in environment variables");
  }
  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      onlyMainContent: false,
      maxAge: 172800000,
      parsers: ["pdf"],
      formats: ["markdown"],
    }),
  });
  const data = await response.json();
  return data.data?.markdown ?? "";
}
