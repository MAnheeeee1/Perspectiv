export interface NewsSource {
  name: string;
  section: string;
  url: string;
  retrieved_date: string;
}

export interface NewsItem {
  title: string;
  author: null;
  timestamp: string;
  section: string;
  content: string | null;
  image: null;
  url: string | null;
}

export interface ParsedNews {
  source: NewsSource;
  news_items: NewsItem[];
}

// Matches: "3 min", "1 tim", "Igår 20:42", "Igår 20.42"
const TIMESTAMP_RE = /\d+\s+(?:min|tim)|Igår\s+\d{1,2}[.:]\d{2}/;

// Each article line: [{timestamp}{section}\\\n\\\n **{title}**]({url})
const ARTICLE_RE = new RegExp(
  `\\[(${TIMESTAMP_RE.source})(.*?)\\\\\\\\\\n\\\\\\\\\\n\\s*\\*\\*([\\s\\S]*?)\\*\\*\\]\\(([^)]+)\\)`,
  "g",
);

function extractSource(markdown: string): NewsSource {
  const svdMatch = markdown.match(/\[Svenska Dagbladet[^\]]*\]\((https?:\/\/[^)]+)\)/);
  const url = svdMatch?.[1] ?? "https://www.svd.se/";

  const h1Match = markdown.match(/^#\s+(.+)$/m);
  const section = h1Match?.[1]?.trim() ?? "Nyheter";

  const today = new Date().toISOString().split("T")[0];

  return { name: "Svenska Dagbladet", section, url, retrieved_date: today };
}

function sliceNewsSection(markdown: string): string {
  const start = markdown.indexOf(
    "Här samlar vi de senaste artiklarna på SvD, i kronologisk ordning.",
  );
  const end = markdown.indexOf("[**Kundservice**]");

  const from = start !== -1 ? start : 0;
  const to = end !== -1 ? end : markdown.length;
  return markdown.slice(from, to);
}

export function parseMarkdownNews(markdown: string, maxItems = 15): ParsedNews {
  const source = extractSource(markdown);
  const section = sliceNewsSection(markdown);

  const news_items: NewsItem[] = [];
  let match: RegExpExecArray | null;

  ARTICLE_RE.lastIndex = 0;
  while ((match = ARTICLE_RE.exec(section)) !== null && news_items.length < maxItems) {
    const [, timestamp, sectionName, title, url] = match;

    news_items.push({
      title: title.trim(),
      author: null,
      timestamp: timestamp.trim(),
      section: sectionName.trim(),
      content: null,
      image: null,
      url: url.startsWith("http") ? url : `${source.url.replace(/\/$/, "")}${url}`,
    });
  }

  return { source, news_items };
}
