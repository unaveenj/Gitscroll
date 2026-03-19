"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRepoFeed } from "@/hooks/useRepoFeed";
import { CardStack } from "./CardStack";
import { RepoCardSkeleton } from "./RepoCardSkeleton";
import type { GitHubRepo } from "@/types/github";

// ─── Language filter config ────────────────────────────────────────────────────

const LANG_FILTERS = [
  { key: "all",        label: "All",        emoji: "✦"  },
  { key: "Python",     label: "Python",     emoji: "🔥" },
  { key: "TypeScript", label: "TS",         emoji: "⚡" },
  { key: "JavaScript", label: "JS",         emoji: "🌐" },
  { key: "Rust",       label: "Rust",       emoji: "🦀" },
  { key: "Go",         label: "Go",         emoji: "🐹" },
  { key: "Java",       label: "Java",       emoji: "☕" },
  { key: "C++",        label: "C++",        emoji: "⚙️" },
  { key: "Swift",      label: "Swift",      emoji: "🍎" },
  { key: "Kotlin",     label: "Kotlin",     emoji: "🎯" },
];

function filterRepos(repos: GitHubRepo[], lang: string, search: string): GitHubRepo[] {
  let result = repos;

  if (lang !== "all") {
    result = result.filter((r) => r.language === lang);
  }

  const term = search.trim().toLowerCase();
  if (term) {
    result = result.filter(
      (r) =>
        r.language?.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.topics.some((t) => t.toLowerCase().includes(term)) ||
        (r.description ?? "").toLowerCase().includes(term)
    );
  }

  return result;
}

// ─── RepoFeed ─────────────────────────────────────────────────────────────────

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
  const [langFilter, setLangFilter]     = useState("all");
  const [searchTerm, setSearchTerm]     = useState("");

  // Reset card index whenever the filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [langFilter, searchTerm]);

  const filteredRepos = filterRepos(repos, langFilter, searchTerm);

  const handleAdvance = useCallback(() => {
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Layout wrapper ─────────────────────────────────────────────────────────
  const wrapStyle: React.CSSProperties = {
    position: "fixed",
    top: "var(--header-height)",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div style={{ ...wrapStyle, justifyContent: "center" }} className="gap-3">
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
      <div style={{ ...wrapStyle, justifyContent: "center" }}>
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
  const isDone =
    currentIndex >= filteredRepos.length &&
    !hasNextPage &&
    !isFetchingNextPage;

  if (isDone && repos.length > 0) {
    const noResults = filteredRepos.length === 0 && repos.length > 0;
    return (
      <div style={{ ...wrapStyle, justifyContent: "flex-start" }}>
        <FilterBar
          active={langFilter}
          onChange={setLangFilter}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          repos={repos}
        />
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}
        >
          <span className="text-5xl" role="img" aria-label={noResults ? "No results" : "Done"}>
            {noResults ? "🔍" : "🎉"}
          </span>
          <p className="font-display text-xl font-bold text-foreground">
            {noResults ? "No matches found." : "You've seen it all."}
          </p>
          <p className="font-code text-xs tracking-wide" style={{ color: "var(--card-muted)" }}>
            {noResults ? "Try a different filter or clear the search" : "check back later for new gems"}
          </p>
          {noResults ? (
            <button
              className="mt-2 font-code text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-full border transition-all active:scale-95"
              style={{
                borderColor: "var(--filter-pill-active-border)",
                color: "var(--filter-pill-active-text)",
                background: "var(--filter-pill-active-bg)",
              }}
              onClick={() => { setLangFilter("all"); setSearchTerm(""); }}
            >
              ✕ Clear filters
            </button>
          ) : (
            <button
              className="mt-2 font-code text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-full border transition-all active:scale-95"
              style={{
                borderColor: "var(--surprise-btn-border)",
                color: "var(--surprise-btn-color)",
                background: "var(--filter-pill-active-bg)",
              }}
              onClick={() => setCurrentIndex(0)}
              aria-label="Start over"
            >
              ↺ Start over
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Feed ───────────────────────────────────────────────────────────────────
  return (
    <div style={wrapStyle}>
      {/* Progress indicator — absolute so it doesn't affect flex layout */}
      {filteredRepos.length > 0 && (
        <ProgressBar current={currentIndex} total={filteredRepos.length} />
      )}

      {/* Filter bar */}
      <FilterBar
        active={langFilter}
        onChange={setLangFilter}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        repos={repos}
      />

      {/* Card area — fills remaining vertical space, centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: 0,
        }}
      >
        {filteredRepos.length === 0 ? (
          <div className="flex flex-col items-center gap-3">
            <span className="text-4xl">🔍</span>
            <p className="font-display text-lg font-bold text-foreground">No matches</p>
            <p className="font-code text-xs" style={{ color: "var(--card-muted)" }}>
              Try a different filter
            </p>
            <button
              className="font-code text-[11px] px-4 py-2 rounded-full border transition-all"
              style={{
                borderColor: "var(--filter-pill-active-border)",
                color: "var(--filter-pill-active-text)",
                background: "var(--filter-pill-active-bg)",
              }}
              onClick={() => { setLangFilter("all"); setSearchTerm(""); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <CardStack
            repos={filteredRepos}
            currentIndex={currentIndex}
            onAdvance={handleAdvance}
            onLoadMore={handleLoadMore}
            hasMore={!!hasNextPage}
            isLoadingMore={isFetchingNextPage}
          />
        )}
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 font-code text-[9px] tracking-[0.2em] uppercase"
          style={{ color: "var(--card-muted)" }}
        >
          loading more…
        </div>
      )}

      {/* Surprise Me button */}
      {filteredRepos.length > 3 && (
        <SurpriseMeButton
          total={filteredRepos.length}
          onJump={(i) => setCurrentIndex(i)}
        />
      )}
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

function FilterBar({
  active,
  onChange,
  searchTerm,
  onSearch,
  repos,
}: {
  active: string;
  onChange: (lang: string) => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  repos: GitHubRepo[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show language pills that actually have repos in the current feed
  const availableLangs = new Set(repos.map((r) => r.language).filter(Boolean));
  const visibleFilters = LANG_FILTERS.filter(
    (f) => f.key === "all" || availableLangs.has(f.key)
  );

  return (
    <div
      className="w-full flex flex-col gap-1.5"
      style={{ maxWidth: "432px", padding: "8px 16px 4px", zIndex: 40 }}
    >
      {/* Language pills row */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none"
        style={{ touchAction: "pan-x" }}
      >
        {visibleFilters.map(({ key, label, emoji }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex-shrink-0 flex items-center gap-1 font-code text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all active:scale-95"
              style={{
                background: isActive
                  ? "var(--filter-pill-active-bg)"
                  : "var(--filter-pill-bg)",
                borderColor: isActive
                  ? "var(--filter-pill-active-border)"
                  : "var(--filter-pill-border)",
                color: isActive
                  ? "var(--filter-pill-active-text)"
                  : "var(--filter-pill-text)",
              }}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Search input */}
      <div className="relative flex items-center">
        <svg
          className="absolute left-2.5 pointer-events-none"
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          style={{ color: "var(--search-input-placeholder)" }}
        >
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, topic, language…"
          className="w-full font-code text-[11px] rounded-xl border pl-7 pr-8 py-1.5 outline-none transition-all"
          style={{
            background: "var(--search-input-bg)",
            borderColor: searchTerm
              ? "var(--filter-pill-active-border)"
              : "var(--search-input-border)",
            color: "var(--search-input-text)",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onFocus={(e: any) => {
            e.target.style.borderColor = "var(--filter-pill-active-border)";
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onBlur={(e: any) => {
            if (!searchTerm) e.target.style.borderColor = "var(--search-input-border)";
          }}
        />
        {searchTerm && (
          <button
            className="absolute right-2.5 transition-opacity"
            style={{ color: "var(--card-muted)" }}
            onClick={() => { onSearch(""); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
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
        background: "var(--surprise-btn-bg)",
        border: "1px solid var(--surprise-btn-border)",
        color: "var(--surprise-btn-color)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
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
