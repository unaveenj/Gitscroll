"use client";

import { useEffect, useRef } from "react";
import React from "react";
import { useRepoFeed } from "@/hooks/useRepoFeed";
import { RepoCard } from "./RepoCard";
import { RepoCardSkeleton } from "./RepoCardSkeleton";

/**
 * Scroll container spec:
 *   height         : 100vh  (fills full viewport)
 *   overflow-y     : scroll
 *   scroll-snap    : y mandatory
 *   scroll-padding : top = header height so snapped cards clear the fixed header
 *
 * Card slot spec (see RepoCard.tsx):
 *   height         : 92vh
 *   margin-bottom  : 2vh   → exposes ~2vh peek of the next card below each snap
 */
export function RepoFeed() {
  const { repos, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useRepoFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Pre-fetch next page when the 3rd-to-last card enters view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const containerStyle: React.CSSProperties = {
    height: "100vh",
    overflowY: "scroll",
    // Offset snap points below the fixed header so each snapped card
    // is never obscured. This replaces the old wrapper padding-top approach.
    scrollPaddingTop: "var(--header-height)",
  };

  const endSlotStyle: React.CSSProperties = {
    height: "92vh",
    marginBottom: "2vh",
  };

  if (isLoading) {
    return (
      <div className="snap-y-mandatory" style={containerStyle}>
        {Array.from({ length: 3 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="snap-y-mandatory" style={containerStyle}>
      {repos.map((repo, index) => (
        <React.Fragment key={repo.id}>
          {/* Sentinel fires when the 3rd-to-last card enters view */}
          {hasNextPage && repos.length >= 3 && index === repos.length - 3 && (
            <div ref={sentinelRef} className="absolute h-0 w-0" aria-hidden />
          )}
          <RepoCard repo={repo} />
        </React.Fragment>
      ))}

      {isFetchingNextPage && <RepoCardSkeleton />}

      {!hasNextPage && repos.length > 0 && (
        <div
          className="flex w-full flex-col items-center justify-center snap-start snap-stop-always gap-2"
          style={endSlotStyle}
        >
          <span className="text-3xl">🎉</span>
          <p className="text-sm font-medium text-muted-foreground">
            You&apos;ve seen it all.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Check back later for more repos.
          </p>
        </div>
      )}
    </div>
  );
}
