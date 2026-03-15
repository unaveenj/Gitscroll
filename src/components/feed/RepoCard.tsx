"use client";

import type { GitHubRepo } from "@/types/github";
import { RepoCardPanel } from "./RepoCardPanel";

interface RepoCardProps {
  repo: GitHubRepo;
  index: number;
  total: number;
}

/**
 * Scroll-snap slot — owns positioning only.
 *
 * height        : 92vh  — slightly shorter than the viewport so the
 * margin-bottom : 2vh     next card's top edge peeks into view
 *
 * All visual content lives in <RepoCardPanel>.
 *
 * Phase 4: wrap <RepoCardPanel> with react-tinder-card here.
 * RepoCardPanel requires zero changes for that migration.
 */
export function RepoCard({ repo, index, total }: RepoCardProps) {
  return (
    <div
      data-repo-card
      className="relative flex w-full flex-col items-center justify-center snap-start snap-stop-always"
      style={{ height: "92vh", marginBottom: "2vh" }}
    >
      <RepoCardPanel repo={repo} index={index} total={total} />

      {/* Subtle fade at the bottom edge — softens the peek transition */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-background/40"
        aria-hidden
      />
    </div>
  );
}
