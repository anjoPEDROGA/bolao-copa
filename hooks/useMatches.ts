"use client";

import useSWR, { type KeyedMutator } from "swr";
import { fetchMatchesFromFallback, fetchWorldcupMatches } from "@/lib/api";
import { getRefreshInterval } from "@/lib/polling/intervals";
import type { ApiSource, Match } from "@/types";

type MatchesResponse = {
  matches: Match[];
  source: ApiSource;
};

async function fetchMatchesWithFallback(): Promise<MatchesResponse> {
  try {
    const worldcupMatches = await fetchWorldcupMatches();

    if (worldcupMatches.length > 0) {
      return { matches: worldcupMatches, source: "worldcup" };
    }

    const fallbackMatches = await fetchMatchesFromFallback();

    if (fallbackMatches.length > 0) {
      return { matches: fallbackMatches, source: "fallback" };
    }

    return { matches: [], source: "empty" };
  } catch (worldcupError) {
    try {
      const fallbackMatches = await fetchMatchesFromFallback();

      if (fallbackMatches.length > 0) {
        return { matches: fallbackMatches, source: "fallback" };
      }

      return { matches: [], source: "empty" };
    } catch (fallbackError) {
      throw fallbackError ?? worldcupError;
    }
  }
}

export function useMatches(): {
  matches: Match[];
  source: ApiSource;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  mutate: KeyedMutator<MatchesResponse>;
} {
  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(
    "matches",
    fetchMatchesWithFallback,
    {
      refreshInterval: (currentData) => getRefreshInterval(currentData?.matches)
    }
  );

  return {
    matches: data?.matches ?? [],
    source: data?.source ?? "empty",
    isLoading,
    isError: Boolean(error),
    error,
    mutate
  };
}
