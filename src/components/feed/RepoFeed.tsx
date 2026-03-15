"use client";

import { useEffect, useRef } from "react";
import React from "react";
import { useRepoFeed } from "@/hooks/useRepoFeed";
import { RepoCard } from "./RepoCard";
import { RepoCardSkeleton } from "./RepoCardSkeleton";

export function RepoFeed() {
  const { repos, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useRepoFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const feedStyle = { height: "calc(100vh - var(--header-height))" };
  const cardSlotStyle = { height: "calc((100vh - var(--header-height)) * 0.88)" };

  if (isLoading) {
    return (
      <div className="overflow-y-scroll snap-y-mandatory" style={feedStyle}>
        {Array.from({ length: 3 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-y-scroll snap-y-mandatory" style={feedStyle}>
      {repos.map((repo, index) => (
        <React.Fragment key={repo.id}>
          {/* Pre-fetch sentinel: fires when 3rd-to-last card enters view */}
          {hasNextPage && repos.length >= 3 && index === repos.length - 3 && (
            <div ref={sentinelRef} className="absolute h-0 w-0" aria-hidden />
          )}
          <RepoCard repo={repo} />
        </React.Fragment>
      ))}

      {isFetchingNextPage && <RepoCardSkeleton />}

      {!hasNextPage && repos.length > 0 && (
        <div
          className="flex w-full flex-col items-center justify-center snap-start snap-always snap-stop-always gap-2"
          style={cardSlotStyle}
        >
          <span className="text-2xl">🎉</span>
          <p className="text-sm font-medium text-muted-foreground">
            You&apos;ve seen it all.
          </p>
          <p className="text-xs text-muted-foreground/70">Check back later for more repos.</p>
        </div>
      )}
    </div>
  );
}
