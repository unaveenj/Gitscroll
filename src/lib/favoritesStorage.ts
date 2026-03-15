import type { GitHubRepo } from "@/types/github";

const KEY = "gitscroll:favorites";

export function getFavorites(): GitHubRepo[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GitHubRepo[]) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(repos: GitHubRepo[]): void {
  localStorage.setItem(KEY, JSON.stringify(repos));
}
