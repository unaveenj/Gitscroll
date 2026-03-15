import { useState, useEffect } from "react";
import type { GitHubRepo } from "@/types/github";
import { getFavorites, saveFavorites } from "@/lib/favoritesStorage";

export function useFavorites() {
  const [favorites, setFavorites] = useState<GitHubRepo[]>([]);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage after mount (SSR safe)
  useEffect(() => {
    setFavorites(getFavorites());
    setMounted(true);
  }, []);

  // Persist on every change, but only after hydration
  useEffect(() => {
    if (mounted) saveFavorites(favorites);
  }, [favorites, mounted]);

  function toggle(repo: GitHubRepo) {
    setFavorites((prev) =>
      prev.some((f) => f.id === repo.id)
        ? prev.filter((f) => f.id !== repo.id)
        : [...prev, repo]
    );
  }

  function isSaved(id: number): boolean {
    return favorites.some((f) => f.id === id);
  }

  return { favorites, toggle, isSaved };
}
