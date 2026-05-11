# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured yet.

## Architecture

This is a **Next.js 16** App Router project (React 19) using TypeScript and Tailwind CSS v4.

### API Routes (`app/api/`)

Two route handlers drive the core functionality:

- **`/api/scrapeWebsite`** — Calls Firecrawl (`FIRECRAWL_API_KEY`) to scrape a URL and return its markdown content.
- **`/api/latestNews`** — Receives a `targetPath`, calls `/api/scrapeWebsite` internally, then passes the scraped markdown to DeepSeek (`DEEPSEEK_API_KEY`) with the system prompt from `extractionAgent.md`. Returns structured JSON news items.

`extractionAgent.md` at the project root is the LLM system prompt — it defines the extraction schema (source metadata + up to 15 news items with title, author, timestamp, content, image, url).

### Required env vars

```
DEEPSEEK_API_KEY=
FIRECRAWL_API_KEY=
```

## Next.js 16 Breaking Changes to Know

This project runs Next.js **16.2.4**. Key differences from Next.js 14/15:

- **Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, and `params` in layouts/pages/route handlers **must** be awaited. Synchronous access is fully removed.
- **`middleware` renamed to `proxy`** — Use `proxy.ts` instead of `middleware.ts`; export `proxy` not `middleware`. The `edge` runtime is not supported in `proxy`.
- **`next lint` removed** — Use the `eslint` CLI directly (`npm run lint` already does this).
- **`revalidateTag`** now requires a second `cacheLife` argument.
- Config flags with "middleware" in the name (e.g. `skipMiddlewareUrlNormalize`) are renamed to use "proxy" (e.g. `skipProxyUrlNormalize`).

Before writing routing, middleware/proxy, or caching code, consult `node_modules/next/dist/docs/` for the authoritative API reference.
