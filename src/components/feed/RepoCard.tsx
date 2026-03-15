"use client";

import { Star, ExternalLink, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GitHubRepo } from "@/types/github";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  "C++": "bg-pink-500",
  Swift: "bg-orange-400",
};

const IDEAS: Record<string, string> = {
  Python: "Build a personalised AI assistant with this as a base",
  TypeScript: "Create a SaaS product using this stack",
  Rust: "Build high-performance tooling inspired by this",
  Go: "Develop a microservice using these patterns",
  default: "Fork and extend this for your next side project",
};

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

interface RepoCardProps {
  repo: GitHubRepo;
}

export function RepoCard({ repo }: RepoCardProps) {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] ?? "bg-slate-500" : "bg-slate-500";
  const idea = repo.language ? IDEAS[repo.language] ?? IDEAS.default : IDEAS.default;

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center snap-start snap-always px-6"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={repo.owner.avatar_url}
              alt={repo.owner.login}
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm text-muted-foreground">{repo.owner.login}</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight">{repo.name}</h2>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {repo.description ?? "No description provided."}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3">
          {repo.language && (
            <Badge variant="secondary" className="gap-1.5">
              <span className={`h-2 w-2 rounded-full ${langColor}`} />
              {repo.language}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{formatStars(repo.stargazers_count)} stars</span>
          </div>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.topics.slice(0, 4).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        )}

        {/* Idea */}
        <div className="flex items-start gap-2 rounded-lg bg-accent p-3">
          <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-yellow-500" />
          <p className="text-sm text-accent-foreground">{idea}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Star className="mr-1.5 h-4 w-4" /> Save
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => window.open(repo.html_url, "_blank", "noopener noreferrer")}
          >
            <ExternalLink className="mr-1.5 h-4 w-4" /> Open Repo
          </Button>
        </div>
      </div>

      {/* Scroll hint */}
      <p className="absolute bottom-8 text-xs text-muted-foreground animate-bounce">
        Scroll for next ↓
      </p>
    </div>
  );
}
