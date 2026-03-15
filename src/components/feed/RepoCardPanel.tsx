"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import type { GitHubRepo, RepoCategory } from "@/types/github";
import { useFavorites } from "@/hooks/useFavorites";

// ─── Category theme system ────────────────────────────────────────────────────

interface CategoryTheme {
  label: string;
  emoji: string;
  accent: string;
  topGlow: string;
  cardShadow: string;
  ideaBg: string;
  ideaBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  chipBg: string;
  chipBorder: string;
}

const CATEGORY_THEMES: Record<RepoCategory, CategoryTheme> = {
  TRENDING: {
    label: "TRENDING",
    emoji: "🔥",
    accent: "#fb923c",
    topGlow: "linear-gradient(160deg, rgba(251,146,60,0.13) 0%, transparent 55%)",
    cardShadow: "0 0 0 1px rgba(251,146,60,0.16), 0 0 40px rgba(251,146,60,0.08), 0 16px 48px rgba(0,0,0,0.65)",
    ideaBg: "rgba(251,146,60,0.07)",
    ideaBorder: "rgba(251,146,60,0.22)",
    badgeBg: "bg-orange-500/[0.12]",
    badgeText: "text-orange-400",
    badgeBorder: "border-orange-500/25",
    chipBg: "rgba(251,146,60,0.10)",
    chipBorder: "rgba(251,146,60,0.28)",
  },
  AI: {
    label: "AI TOOL",
    emoji: "🤖",
    accent: "#a78bfa",
    topGlow: "linear-gradient(160deg, rgba(167,139,250,0.15) 0%, transparent 55%)",
    cardShadow: "0 0 0 1px rgba(167,139,250,0.18), 0 0 40px rgba(139,92,246,0.10), 0 16px 48px rgba(0,0,0,0.65)",
    ideaBg: "rgba(139,92,246,0.08)",
    ideaBorder: "rgba(167,139,250,0.24)",
    badgeBg: "bg-violet-500/[0.12]",
    badgeText: "text-violet-400",
    badgeBorder: "border-violet-500/25",
    chipBg: "rgba(139,92,246,0.12)",
    chipBorder: "rgba(167,139,250,0.28)",
  },
  TOOLS: {
    label: "DEV TOOL",
    emoji: "⚡",
    accent: "#22d3ee",
    topGlow: "linear-gradient(160deg, rgba(34,211,238,0.12) 0%, transparent 55%)",
    cardShadow: "0 0 0 1px rgba(34,211,238,0.16), 0 0 40px rgba(6,182,212,0.08), 0 16px 48px rgba(0,0,0,0.65)",
    ideaBg: "rgba(6,182,212,0.07)",
    ideaBorder: "rgba(34,211,238,0.22)",
    badgeBg: "bg-cyan-500/[0.12]",
    badgeText: "text-cyan-400",
    badgeBorder: "border-cyan-500/25",
    chipBg: "rgba(6,182,212,0.10)",
    chipBorder: "rgba(34,211,238,0.26)",
  },
  FUN: {
    label: "FUN PROJECT",
    emoji: "🎮",
    accent: "#fb7185",
    topGlow: "linear-gradient(160deg, rgba(251,113,133,0.13) 0%, transparent 55%)",
    cardShadow: "0 0 0 1px rgba(251,113,133,0.16), 0 0 40px rgba(244,63,94,0.08), 0 16px 48px rgba(0,0,0,0.65)",
    ideaBg: "rgba(244,63,94,0.07)",
    ideaBorder: "rgba(251,113,133,0.22)",
    badgeBg: "bg-rose-500/[0.12]",
    badgeText: "text-rose-400",
    badgeBorder: "border-rose-500/25",
    chipBg: "rgba(244,63,94,0.10)",
    chipBorder: "rgba(251,113,133,0.26)",
  },
};

// ─── Language data ────────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3b82f6", JavaScript: "#fbbf24", Python: "#34d399",
  Rust: "#fb923c", Go: "#22d3ee", Java: "#f87171", "C++": "#e879f9",
  Swift: "#fb923c", Ruby: "#f87171", Kotlin: "#a78bfa", C: "#94a3b8", Shell: "#34d399",
};

const LANG_EMOJI: Record<string, string> = {
  TypeScript: "⚡", JavaScript: "🌐", Python: "🔥", Rust: "🦀",
  Go: "🐹", Java: "☕", "C++": "⚙️", Swift: "🍎", Ruby: "💎",
  Kotlin: "🎯", C: "🔩", Shell: "🐚",
};

const IDEAS: Record<string, string> = {
  TypeScript:  "Ship a SaaS product using this exact stack",
  JavaScript:  "Build a browser extension powered by this",
  Python:      "Train a fine-tuned model on your own dataset",
  Rust:        "Write a blazing-fast CLI tool inspired by this",
  Go:          "Build a self-hosted microservice with these patterns",
  Java:        "Extend this into an enterprise API with Spring Boot",
  "C++":       "Compile to WebAssembly and run it in the browser",
  Swift:       "Port into a native iOS app and ship to the App Store",
  Ruby:        "Launch a polished web app using this as the backbone",
  Kotlin:      "Build a cross-platform app with Compose Multiplatform",
  default:     "Fork, personalise, and launch as your side project",
};

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface RepoCardPanelProps {
  repo: GitHubRepo;
  index: number;
  total: number;
}

export function RepoCardPanel({ repo, index, total }: RepoCardPanelProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { toggle, isSaved } = useFavorites();

  const saved     = isSaved(repo.id);
  const theme     = CATEGORY_THEMES[repo.category];
  const langEmoji = repo.language ? (LANG_EMOJI[repo.language] ?? "🔥") : "🔥";
  const langColor = repo.language ? (LANG_COLORS[repo.language] ?? "#64748b") : "#64748b";
  const idea      = repo.language ? (IDEAS[repo.language] ?? IDEAS.default) : IDEAS.default;
  const topicChips = repo.topics.slice(0, 2);

  return (
    /*
     * Outer shell: 3D perspective context + glow shadow.
     * No overflow:hidden — clipping lives on each face so preserve-3d works.
     */
    <div
      className="relative w-full h-full rounded-2xl cursor-pointer select-none"
      style={{ perspective: "1200px", boxShadow: theme.cardShadow }}
      onClick={() => setIsFlipped((f) => !f)}
    >
      {/* Base surface */}
      <div className="absolute inset-0 rounded-2xl -z-10" style={{ background: "#08111e" }} />

      {/* Category diagonal glow — top-left corner wash */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none -z-10"
        style={{ background: theme.topGlow }}
      />

      {/* Card counter — top-right, above both faces */}
      <div
        className="absolute top-3.5 right-4 z-20 font-code text-[10px] tabular-nums pointer-events-none"
        style={{ color: theme.accent, opacity: 0.55 }}
      >
        {String(index + 1).padStart(2, "0")}&thinsp;/&thinsp;{String(total).padStart(2, "0")}
      </div>

      {/* Flip container */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.48s cubic-bezier(0.34, 1.35, 0.64, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >

        {/* ── FRONT FACE ──
         * 5 sections distributed with justify-between so content fills
         * the card without pooling whitespace in one place.
         */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", padding: "18px 20px 16px" }}
        >

          {/* §1 — Category badge */}
          <div className="flex items-center">
            <span
              className={`
                inline-flex items-center gap-1.5 font-code font-semibold
                text-[9px] tracking-[0.16em] uppercase px-2.5 py-[4px]
                rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}
              `}
            >
              {theme.emoji}&nbsp;{theme.label}
            </span>
          </div>

          {/* §2 — Title + owner */}
          <div className="mt-3">
            <h2
              className="font-display font-bold leading-[1.18] tracking-tight line-clamp-2"
              style={{ fontSize: "clamp(1.15rem, 3.5vw, 1.45rem)", color: "#ecf0ff" }}
            >
              {repo.name.replace(/-/g, " ")}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="h-3.5 w-3.5 rounded-full"
                style={{ opacity: 0.45 }}
              />
              <span
                className="font-code text-[10px] tracking-wide leading-none"
                style={{ color: "rgba(148,163,184,0.5)" }}
              >
                {repo.owner.login}
              </span>
            </div>
          </div>

          {/* §3 — Description */}
          <p
            className="mt-3 text-[12.5px] leading-[1.55] line-clamp-2"
            style={{ color: "rgba(203,213,225,0.68)" }}
          >
            {repo.description ?? "No description provided."}
          </p>

          {/* §4 — Tech chips + stars in one row */}
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {repo.language && (
              <span
                className="font-code text-[10px] font-medium px-2 py-[3px] rounded-md border"
                style={{ background: theme.chipBg, borderColor: theme.chipBorder, color: theme.accent }}
              >
                {langEmoji}&nbsp;{repo.language}
              </span>
            )}
            {topicChips.map((t) => (
              <span
                key={t}
                className="font-code text-[10px] px-2 py-[3px] rounded-md border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.5)" }}
              >
                {t}
              </span>
            ))}
            {/* Stars — pushed to right */}
            <div className="ml-auto flex items-center gap-1 flex-shrink-0">
              <span className="text-[13px]" aria-hidden>⭐</span>
              <span
                className="font-code text-[11px] font-semibold"
                style={{ color: "rgba(251,191,36,0.85)" }}
              >
                {formatStars(repo.stargazers_count)}
              </span>
            </div>
          </div>

          {/* §5 — Idea spark strip */}
          <div
            className="mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2.5 border"
            style={{ background: theme.ideaBg, borderColor: theme.ideaBorder }}
          >
            <span
              className="font-code text-[8px] font-bold tracking-[0.2em] uppercase flex-shrink-0 animate-glow-pulse"
              style={{ color: theme.accent }}
            >
              💡
            </span>
            <p
              className="text-[11.5px] leading-[1.45] line-clamp-2 flex-1 min-w-0"
              style={{ color: "rgba(203,213,225,0.72)" }}
            >
              {idea}
            </p>
          </div>

          {/* §6 — Actions */}
          <div className="mt-3 flex gap-2">
            <button
              className="flex items-center justify-center gap-1.5 font-code text-[11px] font-medium
                         px-3.5 py-2 rounded-xl border transition-all active:scale-95
                         hover:bg-white/[0.05] hover:border-white/[0.16]"
              style={{
                borderColor: "rgba(255,255,255,0.09)",
                color: saved ? "#ecf0ff" : "rgba(148,163,184,0.65)",
              }}
              onClick={(e) => { e.stopPropagation(); toggle(repo); }}
              aria-label={saved ? "Remove from favourites" : "Save to favourites"}
            >
              {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              {saved ? "Saved" : "Save"}
            </button>

            <button
              className="flex flex-1 items-center justify-center gap-1.5 font-code text-[11px] font-semibold
                         py-2 rounded-xl border transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${theme.accent}1e, ${theme.accent}0c)`,
                borderColor: `${theme.accent}36`,
                color: theme.accent,
                boxShadow: `0 0 18px ${theme.accent}12`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(repo.html_url, "_blank", "noopener noreferrer");
              }}
              aria-label="Open repository on GitHub"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open on GitHub
            </button>
          </div>

        </div>

        {/* ── BACK FACE ── */}
        <div
          className="absolute inset-0 flex flex-col rounded-2xl overflow-y-auto"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            padding: "18px 20px 16px",
            background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${theme.accent}0a, transparent)`,
          }}
        >
          {/* Header */}
          <div className="pr-10 mb-3">
            <p
              className="font-code text-[9px] tracking-[0.18em] uppercase mb-1.5"
              style={{ color: "rgba(148,163,184,0.38)" }}
            >
              {repo.full_name}
            </p>
            <h2
              className="font-display text-lg font-bold leading-tight"
              style={{ color: "#ecf0ff" }}
            >
              {repo.name.replace(/-/g, " ")}
            </h2>
          </div>

          {/* Full description */}
          <p
            className="text-[12.5px] leading-relaxed mb-4"
            style={{ color: "rgba(203,213,225,0.70)" }}
          >
            {repo.description ?? "No description provided."}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm">⭐</span>
              <span className="font-code text-sm font-bold" style={{ color: "rgba(251,191,36,0.85)" }}>
                {formatStars(repo.stargazers_count)}
              </span>
            </div>
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: langColor }} />
                <span className="font-code text-xs" style={{ color: "rgba(148,163,184,0.58)" }}>
                  {repo.language}
                </span>
              </div>
            )}
          </div>

          {/* All topics */}
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {repo.topics.map((topic) => (
                <span
                  key={topic}
                  className="font-code text-[10px] px-2 py-[3px] rounded-md border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(148,163,184,0.50)" }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Bottom actions */}
          <div className="mt-auto">
            <p
              className="text-center font-code text-[9px] tracking-[0.2em] uppercase mb-2.5"
              style={{ color: "rgba(148,163,184,0.22)" }}
            >
              tap to flip back
            </p>
            <div className="flex gap-2">
              <button
                className="flex items-center justify-center gap-1.5 font-code text-[11px] font-medium
                           px-3.5 py-2 rounded-xl border transition-all active:scale-95 hover:bg-white/[0.05]"
                style={{ borderColor: "rgba(255,255,255,0.09)", color: saved ? "#ecf0ff" : "rgba(148,163,184,0.65)" }}
                onClick={(e) => { e.stopPropagation(); toggle(repo); }}
                aria-label={saved ? "Remove from favourites" : "Save to favourites"}
              >
                {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                {saved ? "Saved" : "Save"}
              </button>

              <button
                className="flex flex-1 items-center justify-center gap-1.5 font-code text-[11px] font-semibold
                           py-2 rounded-xl border transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}1e, ${theme.accent}0c)`,
                  borderColor: `${theme.accent}36`,
                  color: theme.accent,
                  boxShadow: `0 0 18px ${theme.accent}12`,
                }}
                onClick={(e) => { e.stopPropagation(); window.open(repo.html_url, "_blank", "noopener noreferrer"); }}
                aria-label="Open repository on GitHub"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open on GitHub
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
