/**
 * FeedManager — SERVER ONLY.
 *
 * Maintains persistent category buckets and generates the curated feed
 * on demand. Designed for incremental appending: each GitHub API page
 * (Phase 3) can be appended without re-processing earlier pages.
 *
 * Phase 3 usage pattern:
 *   const manager = new FeedManager();
 *   // For each API page:
 *   manager.appendRaw(apiPage.items);   // categorizes + appends
 *   const feed = manager.getFeed();     // interleaved result so far
 */

import type { GitHubRepo, RepoCategory } from "@/types/github";
import { buildFeed, categorizeRepo } from "./feedBuilder";

export class FeedManager {
  private readonly buckets: Record<RepoCategory, GitHubRepo[]> = {
    TRENDING: [],
    AI: [],
    TOOLS: [],
    FUN: [],
  };

  /**
   * Append repos that already have a category assigned.
   * Used with mock data (categories are pre-labeled in mockRepos.ts).
   */
  append(repos: GitHubRepo[]): void {
    for (const repo of repos) {
      this.buckets[repo.category].push(repo);
    }
  }

  /**
   * Categorize raw repos then append.
   * Phase 3: pass GitHub API items directly — no pre-processing needed.
   *
   *   const { items } = await githubApiPage.json();
   *   manager.appendRaw(items);
   */
  appendRaw(repos: Omit<GitHubRepo, "category">[]): void {
    const categorized: GitHubRepo[] = repos.map((r) => ({
      ...r,
      category: categorizeRepo(r),
    }));
    this.append(categorized);
  }

  /**
   * Return all appended repos interleaved in TRENDING → AI → TOOLS → FUN order.
   * Safe to call multiple times — does not mutate internal buckets.
   */
  getFeed(): GitHubRepo[] {
    // Flatten buckets in category order to preserve per-category insertion order,
    // then hand off to buildFeed for pattern interleaving.
    const all = (["TRENDING", "AI", "TOOLS", "FUN"] as const).flatMap(
      (cat) => [...this.buckets[cat]],
    );
    return buildFeed(all);
  }

  /** Total repos stored across all category buckets. */
  get length(): number {
    return (Object.values(this.buckets) as GitHubRepo[][]).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
  }

  /**
   * Clear all buckets.
   * Call before re-seeding with a fresh dataset.
   */
  reset(): void {
    this.buckets.TRENDING = [];
    this.buckets.AI = [];
    this.buckets.TOOLS = [];
    this.buckets.FUN = [];
  }
}
