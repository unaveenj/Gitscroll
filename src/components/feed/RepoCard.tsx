"use client";

import type { GitHubRepo } from "@/types/github";
import { RepoCardPanel } from "./RepoCardPanel";

interface RepoCardProps {
  repo: GitHubRepo;
}

/**
 * Scroll-snap slot — owns positioning only.
 *
 * This div is the unit that scroll-snap latches onto.
 * All visual content lives in <RepoCardPanel>.
 *
 * Phase 4: wrap <RepoCardPanel> with react-tinder-card here.
 * No changes to RepoCardPanel will be needed.
 */
export function RepoCard({ repo }: RepoCardProps) {
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center snap-start snap-always snap-stop-always"
      style={{ height: "calc((100vh - var(--header-height)) * 0.88)" }}
    >
      <RepoCardPanel repo={repo} />

      {/* Fade gradient — softens the peek edge into the next card */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-background/50"
        aria-hidden
      />
    </div>
  );
}
