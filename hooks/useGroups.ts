"use client";

import useSWR, { type KeyedMutator } from "swr";
import { fetchGroupsFromFallback, fetchWorldcupGroups } from "@/lib/api";
import type { ApiSource, Group } from "@/types";

type GroupsResponse = {
  groups: Group[];
  source: ApiSource;
  error?: string | null;
};

let lastSuccessfulGroups: GroupsResponse | null = null;

async function fetchGroupsWithFallback(): Promise<GroupsResponse> {
  try {
    const worldcupResponse = await fetchWorldcupGroups();
    const worldcupGroups = worldcupResponse.data;

    if (worldcupGroups.length > 0) {
      lastSuccessfulGroups = {
        groups: worldcupGroups,
        source: worldcupResponse.source === "proxy" ? "proxy" : "worldcup",
        error: worldcupResponse.error ?? null
      };
      return {
        groups: worldcupGroups,
        source: worldcupResponse.source === "proxy" ? "proxy" : "worldcup",
        error: worldcupResponse.error ?? null
      };
    }

    if (lastSuccessfulGroups) {
      return {
        ...lastSuccessfulGroups,
        error: worldcupResponse.error ?? "Temporary empty groups payload"
      };
    }

    const fallbackGroups = await fetchGroupsFromFallback();

    if (fallbackGroups.length > 0) {
      return { groups: fallbackGroups, source: "fallback", error: null };
    }

    return { groups: [], source: "empty", error: worldcupResponse.error ?? null };
  } catch {
    try {
      const fallbackGroups = await fetchGroupsFromFallback();

      if (fallbackGroups.length > 0) {
        return { groups: fallbackGroups, source: "fallback", error: null };
      }

      if (lastSuccessfulGroups) {
        return { ...lastSuccessfulGroups, error: "Temporary groups error" };
      }

      return { groups: [], source: "empty", error: "Temporary groups error" };
    } catch {
      if (lastSuccessfulGroups) {
        return { ...lastSuccessfulGroups, error: "Temporary groups error" };
      }

      return { groups: [], source: "empty", error: "Temporary groups error" };
    }
  }
}

export function useGroups(): {
  groups: Group[];
  source: ApiSource;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  mutate: KeyedMutator<GroupsResponse>;
} {
  const { data, error, isLoading, mutate } = useSWR<GroupsResponse>(
    "groups",
    fetchGroupsWithFallback,
    {
      keepPreviousData: true
    }
  );

  return {
    groups: data?.groups ?? [],
    source: data?.source ?? "empty",
    isLoading,
    isError: Boolean(error || data?.error),
    error: data?.error ?? error ?? null,
    mutate
  };
}
