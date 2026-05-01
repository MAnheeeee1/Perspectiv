import OpenAI from "openai";

async function scrapeWebsite(url: string) {
  const Apiurl = "https://api.firecrawl.dev/v2/scrape";
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error(
      "FIRECRAWL_API_KEY is not defined in environment variables",
    );
  }
  if (!url) {
    throw new Error("URL is required to scrape content");
  }
  const options = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.FIRECRAWL_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
      onlyMainContent: false,
      maxAge: 172800000,
      parsers: ["pdf"],
      formats: ["markdown"],
    }),
  };

  try {
    const response = await fetch(Apiurl, options);
    const data = await response.json();
    return data.data.markdown || "";
  } catch (error) {
    return `Error scraping website: ${error}`;
  }
}

export async function POST(request: Request) {
  const { targetPath } = await request.json();
  const scrapedContent = await scrapeWebsite(targetPath);

  return new Response(JSON.stringify({ scrapedData: scrapedContent }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
