"use client";

import { useMemo } from "react";
import { calculateAllGroupStandings } from "@/lib/classification/engine";
import { isGroupStageMatch } from "@/lib/api/normalizers";
import { staticGroups } from "@/lib/groups/staticGroups";
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
    isError: matchesError
  } = useMatches();

  const groups = apiGroups.length > 0 ? apiGroups : staticGroups;
  const groupMatches = useMemo(
    () => matches.filter((match) => isGroupStageMatch(match)),
    [matches]
  );

  const standingsByGroup = useMemo(() => {
    if (matchesLoading) {
      return {};
    }

    return calculateAllGroupStandings(groups, groupMatches);
  }, [groups, groupMatches, matchesLoading]);

  return {
    groups,
    standingsByGroup,
    matches,
    groupMatches,
    source: resolveSource(groupSource, matchSource),
    isLoading: groupsLoading || matchesLoading,
    isError: groupsError || matchesError
  };
}
