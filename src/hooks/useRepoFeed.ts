"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { RepoFeedPage } from "@/types/github";

async function fetchRepoPage(page: number): Promise<RepoFeedPage> {
  const res = await fetch(`/api/repos?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
}

export function useRepoFeed() {
  const query = useInfiniteQuery({
    queryKey: ["repos"],
    queryFn: ({ pageParam }) => fetchRepoPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });

  const repos = query.data?.pages.flatMap((page) => page.repos) ?? [];

  return { ...query, repos };
}
