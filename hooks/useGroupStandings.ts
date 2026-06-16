"use client";

import { useEffect, useMemo } from "react";
import { calculateAllGroupStandings } from "@/lib/classification/engine";
import { isGroupStageMatch, normalizeWorldcupGroupId } from "@/lib/api/normalizers";
import { staticGroups } from "@/lib/groups/staticGroups";
import { normalizeGroupKey } from "@/lib/groups/groupIds";
import { useGroups } from "@/hooks/useGroups";
import { useMatches } from "@/hooks/useMatches";
import type { ApiSource, Group, Match, Standing } from "@/types";

function resolveSource(groupSource: ApiSource, matchSource: ApiSource): ApiSource {
  if (groupSource === "worldcup" || matchSource === "worldcup") {
    return "worldcup";
  }

  if (groupSource === "proxy" || matchSource === "proxy") {
    return "proxy";
  }

  if (groupSource === "fallback" || matchSource === "fallback") {
    return "fallback";
  }

  return "empty";
}

export function useGroupStandings(): {
  groups: Group[];
  standingsByGroup: Record<string, Standing[]>;
  matches: Match[];
  groupMatches: Match[];
  source: ApiSource;
  isLoading: boolean;
  isError: boolean;
  total: number;
  groupTotal: number;
  knockoutTotal: number;
} {
  const {
    groups: apiGroups,
    source: groupSource,
    isLoading: groupsLoading,
    isError: groupsError
  } = useGroups();
  const {
    matches,
    source: matchSource,
    isLoading: matchesLoading,
    error: matchesError,
    total,
    groupTotal,
    knockoutTotal
  } = useMatches();

  const groups = apiGroups.length > 0 ? apiGroups : staticGroups;
  const groupMatches = useMemo(
    () =>
      matches.filter((match) => {
        const groupId = normalizeGroupKey(match.groupId);
        return match.stage === "group" && groupId !== null;
      }),
    [matches]
  );

  const standingsByGroup = useMemo(() => {
    if (matchesLoading) {
      return {};
    }

    return calculateAllGroupStandings(groups, groupMatches);
  }, [groups, groupMatches, matchesLoading]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const groupAId = normalizeGroupKey("A");
    const matchesForGroupA = groupAId
      ? groupMatches.filter((match) => normalizeGroupKey(match.groupId) === groupAId)
      : [];

    console.warn("[grupos] matches", {
      total,
      groupMatches: groupMatches.length,
      groups: groups.length,
      groupIds: groupMatches.slice(0, 5).map((match) => match.groupId),
      groupsIds: groups.slice(0, 5).map((group) => normalizeWorldcupGroupId(group.id) ?? group.id),
      matchesForGroupA: matchesForGroupA.length
    });
  }, [groupMatches, groups, knockoutTotal, total, groupTotal]);

  return {
    groups,
    standingsByGroup,
    matches,
    groupMatches,
    source: resolveSource(groupSource, matchSource),
    isLoading: groupsLoading || matchesLoading,
    isError: groupsError || Boolean(matchesError),
    total,
    groupTotal,
    knockoutTotal
  };
}
