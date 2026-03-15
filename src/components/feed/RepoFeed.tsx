"use client";

import { useState, useCallback } from "react";
import { useRepoFeed } from "@/hooks/useRepoFeed";
import { CardStack } from "./CardStack";
import { RepoCardSkeleton } from "./RepoCardSkeleton";

export function RepoFeed() {
  const {
    repos,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useRepoFeed();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAdvance = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Layout wrapper ─────────────────────────────────────────────────────────
  // Fixed viewport below the header, centred, no scroll.
  const wrapStyle: React.CSSProperties = {
    position: "fixed",
    top: "var(--header-height)",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div style={wrapStyle} className="gap-3">
        <span className="text-3xl">⚠️</span>
        <p className="font-code text-sm font-medium text-muted-foreground">
          Failed to load repositories.
        </p>
        <p className="font-code text-xs text-muted-foreground/50">
          Check your connection and try again.
        </p>
      </div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={wrapStyle}>
        <div
          className="relative mx-auto px-4"
          style={{ width: "100%", maxWidth: "512px" }}
        >
          <RepoCardSkeleton />
        </div>
      </div>
    );
  }

  // ── End of feed ────────────────────────────────────────────────────────────
  // currentIndex >= repos.length means all cards have been swiped away.
  const isDone = currentIndex >= repos.length && !hasNextPage && !isFetchingNextPage;

  if (isDone && repos.length > 0) {
    return (
      <div style={wrapStyle} className="gap-4">
        <span className="text-5xl" role="img" aria-label="Done">🎉</span>
        <p
          className="font-display text-xl font-bold"
          style={{ color: "#ecf0ff" }}
        >
          You&apos;ve seen it all.
        </p>
        <p
          className="font-code text-xs tracking-wide"
          style={{ color: "rgba(148,163,184,0.45)" }}
        >
          check back later for new gems
        </p>
        <button
          className="mt-2 font-code text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-full border transition-all active:scale-95"
          style={{
            borderColor: "rgba(0,229,204,0.25)",
            color: "#00e5cc",
            background: "rgba(0,229,204,0.06)",
          }}
          onClick={() => setCurrentIndex(0)}
          aria-label="Start over"
        >
          ↺ Start over
        </button>
      </div>
    );
  }

  // ── Feed ───────────────────────────────────────────────────────────────────
  return (
    <div style={wrapStyle}>
      {/* Progress indicator */}
      {repos.length > 0 && (
        <ProgressBar current={currentIndex} total={repos.length} />
      )}

      <CardStack
        repos={repos}
        currentIndex={currentIndex}
        onAdvance={handleAdvance}
        onLoadMore={handleLoadMore}
        hasMore={!!hasNextPage}
        isLoadingMore={isFetchingNextPage}
      />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 font-code text-[9px] tracking-[0.2em] uppercase"
          style={{ color: "rgba(148,163,184,0.30)" }}
        >
          loading more…
        </div>
      )}

      {/* Surprise Me button */}
      {repos.length > 3 && (
        <SurpriseMeButton
          total={repos.length}
          onJump={(i) => setCurrentIndex(i)}
        />
      )}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div
      className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden"
      style={{ zIndex: 50 }}
      aria-label={`${pct}% through feed`}
    >
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #00e5cc, #a78bfa)",
        }}
      />
    </div>
  );
}

// ─── SurpriseMeButton ─────────────────────────────────────────────────────────

function SurpriseMeButton({
  total,
  onJump,
}: {
  total: number;
  onJump: (i: number) => void;
}) {
  return (
    <button
      className="fixed bottom-6 right-5 z-50 flex items-center gap-2 rounded-full font-code text-[10px] font-semibold px-3.5 py-2 transition-all active:scale-95"
      style={{
        background: "rgba(8,17,30,0.88)",
        border: "1px solid rgba(0,229,204,0.20)",
        color: "#00e5cc",
        boxShadow: "0 0 20px rgba(0,229,204,0.10), 0 8px 32px rgba(0,0,0,0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
      onClick={() => onJump(Math.floor(Math.random() * total))}
      aria-label="Jump to a random repository"
    >
      🎲 Surprise Me
    </button>
  );
}
