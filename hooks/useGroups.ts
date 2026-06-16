"use client";

import useSWR, { type KeyedMutator } from "swr";
import { fetchGroupsFromFallback, fetchWorldcupGroups } from "@/lib/api";
import type { ApiSource, Group } from "@/types";

type GroupsResponse = {
  groups: Group[];
  source: ApiSource;
};

async function fetchGroupsWithFallback(): Promise<GroupsResponse> {
  try {
    const worldcupResponse = await fetchWorldcupGroups();
    const worldcupGroups = worldcupResponse.data;

    if (worldcupGroups.length > 0) {
      return {
        groups: worldcupGroups,
        source: worldcupResponse.source === "proxy" ? "proxy" : "worldcup"
      };
    }

    const fallbackGroups = await fetchGroupsFromFallback();

    if (fallbackGroups.length > 0) {
      return { groups: fallbackGroups, source: "fallback" };
    }

    return { groups: [], source: "empty" };
  } catch {
    try {
      const fallbackGroups = await fetchGroupsFromFallback();

      if (fallbackGroups.length > 0) {
        return { groups: fallbackGroups, source: "fallback" };
      }

      return { groups: [], source: "empty" };
    } catch {
      return { groups: [], source: "empty" };
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
    fetchGroupsWithFallback
  );

  return {
    groups: data?.groups ?? [],
    source: data?.source ?? "empty",
    isLoading,
    isError: Boolean(error),
    error,
    mutate
  };
}
