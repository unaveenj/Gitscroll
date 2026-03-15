"use client";

import { Star, Bookmark, ExternalLink, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types/github";

// ─── Data maps ───────────────────────────────────────────────────────────────

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript:  "bg-blue-500",
  JavaScript:  "bg-yellow-400",
  Python:      "bg-green-500",
  Rust:        "bg-orange-500",
  Go:          "bg-cyan-500",
  Java:        "bg-red-500",
  "C++":       "bg-pink-500",
  Swift:       "bg-orange-400",
};

const IDEAS: Record<string, string> = {
  TypeScript:  "Ship a SaaS product using this exact stack",
  JavaScript:  "Build a browser extension powered by this",
  Python:      "Train a fine-tuned model on your own dataset",
  Rust:        "Write a blazing-fast CLI tool inspired by this",
  Go:          "Build a self-hosted microservice using these patterns",
  Java:        "Extend this into an enterprise API with Spring Boot",
  "C++":       "Compile this to WebAssembly and run it in the browser",
  Swift:       "Port this into a native iOS app and ship to the App Store",
  default:     "Fork this, personalise it, and launch it as your side project",
};

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function repoEmoji(language: string | null): string {
  const map: Record<string, string> = {
    Python: "🔥", TypeScript: "⚡", JavaScript: "🌐",
    Rust: "🦀", Go: "🐹", Java: "☕", "C++": "⚙️", Swift: "🍎",
  };
  return language ? (map[language] ?? "🔥") : "🔥";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RepoCardHeader({ repo }: { repo: GitHubRepo }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={repo.owner.avatar_url}
          alt={repo.owner.login}
          className="h-5 w-5 rounded-full ring-1 ring-border"
        />
        <span className="text-xs font-medium text-muted-foreground tracking-wide">
          {repo.owner.login}
        </span>
      </div>
      <h2 className="text-2xl font-bold leading-tight tracking-tight">
        {repoEmoji(repo.language)}{" "}
        <span className="break-words">{repo.name.replace(/-/g, " ")}</span>
      </h2>
    </div>
  );
}

function RepoCardDescription({ description }: { description: string | null }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
      {description ?? "No description provided."}
    </p>
  );
}

function RepoCardMeta({ repo }: { repo: GitHubRepo }) {
  const langColor = repo.language
    ? (LANGUAGE_COLORS[repo.language] ?? "bg-slate-500")
    : "bg-slate-500";

  const techStack = [
    repo.language,
    ...repo.topics.slice(0, 3),
  ].filter(Boolean).join(", ");

  return (
    <div className="space-y-2">
      {techStack && (
        <p className="text-xs font-medium text-muted-foreground">
          Tech:{" "}
          <span className="text-foreground">{techStack}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {repo.language && (
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${langColor}`} />
            {repo.language}
          </Badge>
        )}
        {repo.topics.slice(0, 3).map((topic) => (
          <Badge key={topic} variant="outline" className="text-xs">
            {topic}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function RepoCardStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base">⭐</span>
      <span className="text-sm font-semibold">{formatStars(count)} stars</span>
    </div>
  );
}

function RepoCardIdea({ repo }: { repo: GitHubRepo }) {
  const idea = repo.language
    ? (IDEAS[repo.language] ?? IDEAS.default)
    : IDEAS.default;

  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-accent/60 px-3 py-2.5 border border-border/50">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
      <p className="text-xs leading-relaxed text-accent-foreground">
        <span className="font-semibold">Idea: </span>
        {idea}
      </p>
    </div>
  );
}

function RepoCardActions({ repo }: { repo: GitHubRepo }) {
  return (
    <div className="flex gap-2 pt-1">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 gap-1.5"
        aria-label="Star this repository"
      >
        <Star className="h-3.5 w-3.5" />
        Star
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 gap-1.5"
        aria-label="Save to favourites"
      >
        <Bookmark className="h-3.5 w-3.5" />
        Save
      </Button>
      <Button
        size="sm"
        className="flex-1 gap-1.5"
        aria-label="Open repository on GitHub"
        onClick={() => window.open(repo.html_url, "_blank", "noopener noreferrer")}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open
      </Button>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface RepoCardPanelProps {
  repo: GitHubRepo;
}

/**
 * All card content lives here.
 *
 * Phase 4 note: react-tinder-card will wrap this component directly.
 * Keep this as a single, self-contained DOM node with no external
 * positioning dependencies so the swipe transform applies cleanly.
 *
 * Flip interaction note: the outer div uses transform-style: preserve-3d
 * via the [transform-style:preserve-3d] class. A future "card back" can be
 * positioned with rotateY(180deg) inside this same container without any
 * layout changes.
 */
export function RepoCardPanel({ repo }: RepoCardPanelProps) {
  return (
    <div
      className="
        w-full
        mx-4 sm:mx-auto
        max-w-full sm:max-w-lg lg:max-w-[900px]
        rounded-2xl border border-border
        bg-card shadow-lg
        px-6 py-6 space-y-4
        transition-transform duration-200
        [transform-style:preserve-3d]
        hover:shadow-xl hover:-translate-y-0.5
      "
    >
      <RepoCardHeader repo={repo} />
      <RepoCardDescription description={repo.description} />
      <RepoCardMeta repo={repo} />
      <RepoCardStars count={repo.stargazers_count} />
      <RepoCardIdea repo={repo} />
      <RepoCardActions repo={repo} />
    </div>
  );
}
