"use client";

import useSWR from "swr";

interface SummaryResult {
  has_readme: boolean;
  summary: string | null;
  error?: string;
}

async function fetcher(url: string): Promise<SummaryResult> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) return { has_readme: false, summary: null, error: json.error ?? "unknown" };
  return json;
}

/**
 * Fetches a README summary for a repo.
 * Pass enabled=false to defer fetching until the card is flipped.
 */
export function useReadmeSummary(
  owner: string,
  repo: string,
  enabled: boolean
) {
  const key = enabled
    ? `/api/summary?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`
    : null;

  const { data, isLoading } = useSWR<SummaryResult>(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    summary: data?.summary ?? null,
    hasReadme: data?.has_readme ?? null,
    serviceDown: data?.error === "summariser_unavailable",
    isLoading,
  };
}
