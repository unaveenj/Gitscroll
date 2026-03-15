# GitScroll

Discover GitHub repositories like TikTok. Scroll through curated repos, swipe to save, and find your next project obsession.

## What it does

GitScroll surfaces interesting GitHub projects in a vertical feed — one card at a time. Each card shows the repo name, description, tech stack, star count, and a quick idea prompt for what you could build with it.

- Scroll vertically through repos (TikTok-style)
- Swipe right to save, left to skip (Tinder-style)
- Favorites stored locally
- Dark mode support
- Pulls live data from GitHub Search API across rotating categories: AI, CLI, developer tools, and general

## Tech Stack

- **Next.js 14** — App Router, API routes
- **Tailwind CSS** — Styling
- **Framer Motion** — Swipe animations
- **TanStack Query** — Data fetching
- **GitHub Search API** — Repo discovery

## Getting Started

```bash
npm install
npm run dev
```

Add a GitHub token to avoid rate limits:

```bash
# .env.local
GITHUB_TOKEN=your_token_here
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Optional | GitHub personal access token. Falls back to mock data if not set. |
