/**
 * GitHub API service — SERVER ONLY.
 *
 * This module is imported exclusively by src/app/api/repos/route.ts.
 * It must never be imported by any client component.
 * GITHUB_TOKEN is read from process.env and never exposed to the browser.
 */

import type { GitHubRepo, RepoFeedPage } from "@/types/github";

const ITEMS_PER_PAGE = 10;

const MOCK_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: "ai-voice-cloner",
    full_name: "example/ai-voice-cloner",
    description: "Clone voices using AI with just 3 seconds of audio.",
    html_url: "https://github.com/example/ai-voice-cloner",
    stargazers_count: 18200,
    language: "Python",
    topics: ["ai", "voice", "pytorch", "deep-learning"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/1" },
  },
  {
    id: 2,
    name: "local-llm-runner",
    full_name: "example/local-llm-runner",
    description: "Run large language models locally on consumer hardware.",
    html_url: "https://github.com/example/local-llm-runner",
    stargazers_count: 34500,
    language: "Rust",
    topics: ["llm", "ai", "rust", "inference"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/2" },
  },
  {
    id: 3,
    name: "shadcn-landing-page",
    full_name: "example/shadcn-landing-page",
    description: "Beautiful landing page components built with shadcn/ui and TailwindCSS.",
    html_url: "https://github.com/example/shadcn-landing-page",
    stargazers_count: 8900,
    language: "TypeScript",
    topics: ["nextjs", "shadcn", "tailwindcss", "ui"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/3" },
  },
  {
    id: 4,
    name: "open-interpreter",
    full_name: "example/open-interpreter",
    description: "Let language models run code on your computer.",
    html_url: "https://github.com/example/open-interpreter",
    stargazers_count: 52000,
    language: "Python",
    topics: ["ai", "llm", "interpreter", "automation"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/4" },
  },
  {
    id: 5,
    name: "gitscroll-clone",
    full_name: "example/gitscroll-clone",
    description: "Discover GitHub repos with a TikTok-style swipeable feed.",
    html_url: "https://github.com/example/gitscroll-clone",
    stargazers_count: 1200,
    language: "TypeScript",
    topics: ["nextjs", "github", "discovery", "swipe"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/5" },
  },
];

/**
 * Fetches a page of trending repositories.
 * Phase 1: returns mock data.
 * Phase 3: replaces with real GitHub Search API calls using GITHUB_TOKEN.
 */
export async function fetchTrendingRepos(page: number = 1): Promise<RepoFeedPage> {
  // Phase 3 will replace this with:
  // const token = process.env.GITHUB_TOKEN;
  // const res = await fetch(`https://api.github.com/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=${ITEMS_PER_PAGE}&page=${page}`, {
  //   headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  //   next: { revalidate: 60 },
  // });

  const start = (page - 1) * ITEMS_PER_PAGE;
  const slice = MOCK_REPOS.slice(start, start + ITEMS_PER_PAGE);

  return {
    repos: slice,
    nextPage: slice.length === ITEMS_PER_PAGE ? page + 1 : null,
  };
}
