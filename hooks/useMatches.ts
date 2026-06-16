"use client";

import useSWR, { type KeyedMutator } from "swr";
import { fetchMatchesFromFallback, fetchWorldcupMatches } from "@/lib/api";
import { getRefreshInterval } from "@/lib/polling/intervals";
import type { ApiSource, Match, MatchesResult } from "@/types";

type MatchesResponse = MatchesResult;

let lastSuccessfulMatches: MatchesResponse | null = null;

async function fetchMatchesWithFallback(): Promise<MatchesResponse> {
  try {
    const worldcupResponse = await fetchWorldcupMatches();
    const worldcupMatches = worldcupResponse.matches;

    if (worldcupMatches.length > 0) {
      lastSuccessfulMatches = worldcupResponse;
      return {
        ...worldcupResponse,
        source: "proxy",
        error: worldcupResponse.error ?? null
      };
    }

    if (lastSuccessfulMatches) {
      return {
        ...lastSuccessfulMatches,
        error: worldcupResponse.error ?? "Temporary empty matches payload"
      };
    }

    const fallbackMatches = await fetchMatchesFromFallback();

    if (fallbackMatches.length > 0) {
      return {
        matches: fallbackMatches,
        data: fallbackMatches,
        source: "fallback",
        total: fallbackMatches.length,
        groupTotal: fallbackMatches.length,
        knockoutTotal: 0,
        error: null
      };
    }

    return {
      matches: [],
      data: [],
      source: "empty",
      total: 0,
      groupTotal: 0,
      knockoutTotal: 0,
      error: worldcupResponse.error ?? null
    };
  } catch (worldcupError) {
    try {
      const fallbackMatches = await fetchMatchesFromFallback();

      if (fallbackMatches.length > 0) {
        return {
          matches: fallbackMatches,
          data: fallbackMatches,
          source: "fallback",
          total: fallbackMatches.length,
          groupTotal: fallbackMatches.length,
          knockoutTotal: 0,
          error: null
        };
      }

      if (lastSuccessfulMatches) {
        return {
          ...lastSuccessfulMatches,
          error: worldcupError instanceof Error ? worldcupError.message : "Temporary matches error"
        };
      }

      return {
        matches: [],
        data: [],
        source: "empty",
        total: 0,
        groupTotal: 0,
        knockoutTotal: 0,
        error: worldcupError instanceof Error ? worldcupError.message : "Temporary matches error"
      };
    } catch (fallbackError) {
      if (lastSuccessfulMatches) {
        return {
          ...lastSuccessfulMatches,
          error:
            fallbackError instanceof Error
              ? fallbackError.message
              : worldcupError instanceof Error
                ? worldcupError.message
                : "Temporary matches error"
        };
      }

      return {
        matches: [],
        data: [],
        source: "empty",
        total: 0,
        groupTotal: 0,
        knockoutTotal: 0,
        error:
          fallbackError instanceof Error
            ? fallbackError.message
            : worldcupError instanceof Error
              ? worldcupError.message
              : "Temporary matches error"
      };
    }
  }
}

export function useMatches(): {
  matches: Match[];
  source: ApiSource;
  isLoading: boolean;
  error: unknown;
  total: number;
  groupTotal: number;
  knockoutTotal: number;
  mutate: KeyedMutator<MatchesResponse>;
} {
  const { data, error, isLoading, mutate } = useSWR<MatchesResponse>(
    "matches",
    fetchMatchesWithFallback,
    {
      keepPreviousData: true,
      refreshInterval: (currentData) => getRefreshInterval(currentData?.matches)
    }
  );

  return {
    matches: data?.matches ?? [],
    source: data?.source ?? "empty",
    isLoading,
    error: data?.error ?? error ?? null,
    total: data?.total ?? 0,
    groupTotal: data?.groupTotal ?? 0,
    knockoutTotal: data?.knockoutTotal ?? 0,
    mutate
  };
}
