"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import type { RepoFeedPage } from "@/types/github";

async function fetchRepoPage(page: number): Promise<RepoFeedPage> {
  console.log(`[useRepoFeed] fetching page ${page}`);
  const res = await fetch(`/api/repos?page=${page}`);
  console.log(`[useRepoFeed] response status: ${res.status}`);
  if (!res.ok) throw new Error("Failed to fetch repos");
  const data: RepoFeedPage = await res.json();
  console.log(`[useRepoFeed] got ${data.repos.length} repos, nextPage: ${data.nextPage}`);
  return data;
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
