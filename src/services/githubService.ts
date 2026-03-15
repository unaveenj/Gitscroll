/**
 * GitHub API service — SERVER ONLY.
 *
 * This module is imported exclusively by src/app/api/repos/route.ts.
 * It must never be imported by any client component.
 * GITHUB_TOKEN is read from process.env and never exposed to the browser.
 */

import type { GitHubRepo, RepoFeedPage } from "@/types/github";
import { MOCK_REPOS } from "./mockRepos";
import { FeedManager } from "./feedManager";

const ITEMS_PER_PAGE = 20;

const GITHUB_API_URL = "https://api.github.com/search/repositories";

const SEARCH_QUERY = "stars:30..500 pushed:>2024-01-01";

// ─── Raw GitHub API shape ─────────────────────────────────────────────────────

interface GitHubSearchItem {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubSearchItem[];
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapItem(item: GitHubSearchItem): Omit<GitHubRepo, "category"> {
  return {
    id: item.id,
    name: item.name,
    full_name: item.full_name,
    description: item.description,
    html_url: item.html_url,
    stargazers_count: item.stargazers_count,
    language: item.language,
    topics: item.topics ?? [],
    owner: {
      login: item.owner.login,
      avatar_url: item.owner.avatar_url,
    },
  };
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

function mockFallback(page: number): RepoFeedPage {
  const manager = new FeedManager();
  manager.append(MOCK_REPOS);
  const feed = manager.getFeed();
  const start = (page - 1) * ITEMS_PER_PAGE;
  const slice = feed.slice(start, start + ITEMS_PER_PAGE);
  return {
    repos: slice,
    nextPage: slice.length === ITEMS_PER_PAGE ? page + 1 : null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch a page of trending repositories.
 *
 * With GITHUB_TOKEN set: fetches live data from GitHub Search API.
 * Without GITHUB_TOKEN: returns mock data (local development fallback).
 *
 * On page 1, a random starting page (1–50) is chosen so sessions begin at
 * different offsets in the dataset. Subsequent pages increment sequentially.
 *
 * Each repo is categorized and interleaved in TRENDING → AI → TOOLS → FUN
 * order via FeedManager before being returned.
 */
export async function fetchRepos(page?: number): Promise<RepoFeedPage> {
  const token = process.env.GITHUB_TOKEN;

  // On page 1 (session start), jump to a random page in the dataset
  // so different users see different slices of mid-tier repos.
  const resolvedPage =
    !page || page === 1 ? Math.floor(Math.random() * 50) + 1 : page;

  if (!token) {
    console.warn("[githubService] GITHUB_TOKEN not set — using mock data");
    return mockFallback(resolvedPage);
  }

  console.log(`[githubService] fetching page ${resolvedPage} from GitHub API`);

  const url = new URL(GITHUB_API_URL);
  url.searchParams.set("q", SEARCH_QUERY);
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", String(ITEMS_PER_PAGE));
  url.searchParams.set("page", String(resolvedPage));

  console.log(`[githubService] GET ${url.toString()}`);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 3600 },
  });

  console.log(`[githubService] response status: ${res.status} ${res.statusText}`);
  console.log(`[githubService] rate limit remaining: ${res.headers.get("x-ratelimit-remaining")} / ${res.headers.get("x-ratelimit-limit")}`);

  if (!res.ok) {
    const body = await res.text();
    console.error(`[githubService] error body: ${body}`);
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data: GitHubSearchResponse = await res.json();
  console.log(`[githubService] received ${data.items.length} repos (total_count: ${data.total_count})`);

  const rawRepos = data.items.map(mapItem);

  const manager = new FeedManager();
  manager.appendRaw(rawRepos);

  return {
    repos: manager.getFeed(),
    nextPage: data.items.length === ITEMS_PER_PAGE ? resolvedPage + 1 : null,
  };
}
