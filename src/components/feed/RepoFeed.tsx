"use client";

import { useEffect, useRef } from "react";
import { useRepoFeed } from "@/hooks/useRepoFeed";
import { RepoCard } from "./RepoCard";
import { RepoCardSkeleton } from "./RepoCardSkeleton";

export function RepoFeed() {
  const { repos, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useRepoFeed();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Trigger next page fetch when the sentinel enters the viewport
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

  if (isLoading) {
    return (
      <div
        className="h-screen overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <RepoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="h-screen overflow-y-scroll"
      style={{ scrollSnapType: "y mandatory" }}
    >
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}

      {/* Infinite scroll sentinel */}
      {hasNextPage && (
        <div ref={sentinelRef} className="h-1" aria-hidden />
      )}

      {isFetchingNextPage && <RepoCardSkeleton />}

      {!hasNextPage && repos.length > 0 && (
        <div
          className="flex h-screen items-center justify-center snap-start"
          style={{ scrollSnapAlign: "start" }}
        >
          <p className="text-muted-foreground text-sm">You&apos;ve seen it all. Check back later!</p>
        </div>
      )}
    </div>
  );
}
