import type { GitHubRepo, RepoCategory } from "@/types/github";

// ─── Topic / language sets ────────────────────────────────────────────────────

const AI_TOPICS = new Set([
  "ai", "machine-learning", "llm", "deep-learning", "neural",
  "gpt", "diffusion", "stable-diffusion", "nlp", "computer-vision",
]);

const TOOLS_TOPICS = new Set([
  "cli", "tool", "developer-tools", "productivity", "devtools",
  "framework", "library", "sdk", "api", "rpc", "microservices",
]);

const TOOLS_LANGUAGES = new Set(["Go", "Rust", "Java"]);

const FUN_TOPICS = new Set([
  "fun", "game", "animation", "demo", "creative", "art", "generative",
]);

const FUN_LANGUAGES = new Set(["C++"]);

// ─── Feed pattern ─────────────────────────────────────────────────────────────

const FEED_PATTERN: RepoCategory[] = ["TRENDING", "AI", "TOOLS", "FUN"];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Derives a category from a repo's topics and language.
 *
 * Called on raw GitHub API repos in Phase 3 — neither `category` nor any
 * GitScroll-specific field is expected on the input.
 */
export function categorizeRepo(
  repo: Pick<GitHubRepo, "topics" | "language">,
): RepoCategory {
  const topics = repo.topics;
  if (topics.some((t) => AI_TOPICS.has(t))) return "AI";
  if (
    topics.some((t) => TOOLS_TOPICS.has(t)) ||
    (repo.language !== null && repo.language !== undefined && TOOLS_LANGUAGES.has(repo.language))
  )
    return "TOOLS";
  if (
    topics.some((t) => FUN_TOPICS.has(t)) ||
    (repo.language !== null && repo.language !== undefined && FUN_LANGUAGES.has(repo.language))
  )
    return "FUN";
  return "TRENDING";
}

/**
 * Reorders a repo list into the repeating TRENDING → AI → TOOLS → FUN pattern.
 *
 * - Buckets repos by their existing `category` field.
 * - Walks the pattern, pulling one repo per slot per round.
 * - Empty buckets are skipped (no cross-category substitution).
 *
 * Phase 3 usage:
 *   const repos = apiRepos.map(r => ({ ...r, category: categorizeRepo(r) }));
 *   return buildFeed(repos);
 */
export function buildFeed(repos: GitHubRepo[]): GitHubRepo[] {
  const buckets: Record<RepoCategory, GitHubRepo[]> = {
    TRENDING: [],
    AI: [],
    TOOLS: [],
    FUN: [],
  };

  for (const repo of repos) {
    buckets[repo.category].push(repo);
  }

  const result: GitHubRepo[] = [];

  while (result.length < repos.length) {
    const before = result.length;
    for (const category of FEED_PATTERN) {
      const next = buckets[category].shift();
      if (next) result.push(next);
    }
    // All remaining buckets are empty — stop.
    if (result.length === before) break;
  }

  return result;
}
