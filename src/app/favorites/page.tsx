"use client";

import Link from "next/link";
import { ArrowLeft, BookmarkX, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import type { GitHubRepo } from "@/types/github";

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

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function FavoriteCard({ repo, onRemove }: { repo: GitHubRepo; onRemove: () => void }) {
  const langColor = repo.language
    ? (LANGUAGE_COLORS[repo.language] ?? "bg-slate-500")
    : "bg-slate-500";

  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4 space-y-3">
      {/* Owner + name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="h-6 w-6 rounded-full ring-1 ring-border shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{repo.full_name}</p>
            <h3 className="font-semibold leading-tight truncate">{repo.name.replace(/-/g, " ")}</h3>
          </div>
        </div>
        <button
          onClick={onRemove}
          aria-label="Remove from favourites"
          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
        >
          <BookmarkX className="h-4 w-4" />
        </button>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2">
        {repo.language && (
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${langColor}`} />
            {repo.language}
          </Badge>
        )}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3" />
          {formatStars(repo.stargazers_count)}
        </span>
      </div>

      {/* Open button */}
      <Button
        size="sm"
        variant="outline"
        className="w-full gap-1.5"
        onClick={() => window.open(repo.html_url, "_blank", "noopener noreferrer")}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open on GitHub
      </Button>
    </div>
  );
}

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to feed"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Favourites</h1>
            <p className="text-sm text-muted-foreground">
              {favorites.length === 0
                ? "Nothing saved yet"
                : `${favorites.length} saved ${favorites.length === 1 ? "repo" : "repos"}`}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-4xl">🔖</p>
            <p className="text-muted-foreground text-sm">
              No saved repositories yet.
              <br />
              Start scrolling and hit <strong>Save</strong> on repos you like.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-4">Go to feed</Button>
            </Link>
          </div>
        )}

        {/* Favorites list */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            {favorites.map((repo) => (
              <FavoriteCard
                key={repo.id}
                repo={repo}
                onRemove={() => toggle(repo)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
