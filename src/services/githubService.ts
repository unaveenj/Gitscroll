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
  {
    id: 6,
    name: "micro-rpc",
    full_name: "example/micro-rpc",
    description: "Minimal RPC framework for building blazing-fast distributed systems in Go.",
    html_url: "https://github.com/example/micro-rpc",
    stargazers_count: 42300,
    language: "Go",
    topics: ["rpc", "distributed-systems", "grpc", "go"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/6" },
  },
  {
    id: 7,
    name: "spring-boot-saas-starter",
    full_name: "example/spring-boot-saas-starter",
    description: "Production-ready SaaS boilerplate with multi-tenancy, billing, and auth baked in.",
    html_url: "https://github.com/example/spring-boot-saas-starter",
    stargazers_count: 28700,
    language: "Java",
    topics: ["spring-boot", "saas", "multi-tenancy", "java"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/7" },
  },
  {
    id: 8,
    name: "webgpu-pathtracer",
    full_name: "example/webgpu-pathtracer",
    description: "Real-time path tracer running entirely on the GPU via WebGPU and C++ bindings.",
    html_url: "https://github.com/example/webgpu-pathtracer",
    stargazers_count: 61400,
    language: "C++",
    topics: ["webgpu", "raytracing", "graphics", "wasm"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/8" },
  },
  {
    id: 9,
    name: "swift-composable-ui",
    full_name: "example/swift-composable-ui",
    description: "Composable, declarative UI architecture for SwiftUI apps. Inspired by React.",
    html_url: "https://github.com/example/swift-composable-ui",
    stargazers_count: 15600,
    language: "Swift",
    topics: ["swiftui", "ios", "architecture", "composable"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/9" },
  },
  {
    id: 10,
    name: "vanilla-framework",
    full_name: "example/vanilla-framework",
    description: "Zero-dependency component framework for the modern web. No build step required.",
    html_url: "https://github.com/example/vanilla-framework",
    stargazers_count: 77200,
    language: "JavaScript",
    topics: ["web-components", "no-build", "vanilla", "framework"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/10" },
  },
  {
    id: 11,
    name: "diffusion-notebooks",
    full_name: "example/diffusion-notebooks",
    description: "Curated Jupyter notebooks for training and fine-tuning diffusion models from scratch.",
    html_url: "https://github.com/example/diffusion-notebooks",
    stargazers_count: 9100,
    language: "Python",
    topics: ["diffusion", "stable-diffusion", "jupyter", "machine-learning"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/11" },
  },
  {
    id: 12,
    name: "query-builder-ts",
    full_name: "example/query-builder-ts",
    description: "Type-safe SQL query builder for TypeScript with zero runtime overhead.",
    html_url: "https://github.com/example/query-builder-ts",
    stargazers_count: 3400,
    language: "TypeScript",
    topics: ["sql", "typescript", "type-safe", "orm"],
    owner: { login: "example", avatar_url: "https://avatars.githubusercontent.com/u/12" },
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
