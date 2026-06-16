import { compareIsoDateAsc } from "@/lib/datetime";
import { isPlaceholderTeamId } from "@/lib/api/normalizers";
import { VALID_GROUP_IDS, normalizeGroupKey } from "@/lib/groups/groupIds";
import { getTeamName } from "@/lib/translations";
import type { Group, Match, Standing } from "@/types";

export type TeamCatalogEntry = {
  teamId: string;
  teamName: string;
  groupId: string;
  groupLabel: string;
  position: number;
  points: number;
  goalDifference: number;
  goalsFor: number;
  goalsAgainst: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
};

export type TeamDetailEntry = TeamCatalogEntry & {
  matches: Match[];
  playedMatches: Match[];
  upcomingMatches: Match[];
};

function getGroupSortIndex(groupId: string): number {
  const normalizedGroupId = normalizeGroupKey(groupId);

  if (!normalizedGroupId) {
    return Number.MAX_SAFE_INTEGER;
  }

  const index = VALID_GROUP_IDS.indexOf(
    normalizedGroupId as (typeof VALID_GROUP_IDS)[number]
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortGroupsByCanonicalOrder(groups: Group[]): Group[] {
  return [...groups].sort((left, right) => {
    const leftIndex = getGroupSortIndex(left.id);
    const rightIndex = getGroupSortIndex(right.id);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.name.localeCompare(right.name, "pt-BR");
  });
}

function getGroupLabel(group: Group, fallbackGroupId: string): string {
  if (group.name.trim()) {
    return group.name;
  }

  return fallbackGroupId.replace(/^group-/, "Grupo ").replace(/^grupo-/i, "Grupo ");
}

function getTeamMatches(teamId: string, matches: Match[]): Match[] {
  return matches.filter(
    (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
  );
}

function isPlayedMatch(match: Match): boolean {
  return match.status === "finished";
}

function isUpcomingMatch(match: Match): boolean {
  return match.status === "scheduled" || match.status === "live";
}

export function buildTeamCatalog(
  groups: Group[],
  standingsByGroup: Record<string, Standing[]>
): TeamCatalogEntry[] {
  const catalog: TeamCatalogEntry[] = [];

  for (const group of sortGroupsByCanonicalOrder(groups)) {
    const normalizedGroupId = normalizeGroupKey(group.id);

    if (!normalizedGroupId) {
      continue;
    }

    const standings = standingsByGroup[group.id] ?? standingsByGroup[normalizedGroupId] ?? [];

    standings.forEach((standing, index) => {
      if (isPlaceholderTeamId(standing.teamId)) {
        return;
      }

      catalog.push({
        teamId: standing.teamId,
        teamName: getTeamName(standing.teamId),
        groupId: normalizedGroupId,
        groupLabel: getGroupLabel(group, normalizedGroupId),
        position: index + 1,
        points: standing.points,
        goalDifference: standing.goalDifference,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        played: standing.played,
        won: standing.won,
        drawn: standing.drawn,
        lost: standing.lost
      });
    });
  }

  return catalog;
}

export function findTeamDetail(
  teamId: string,
  groups: Group[],
  standingsByGroup: Record<string, Standing[]>,
  matches: Match[]
): TeamDetailEntry | null {
  if (isPlaceholderTeamId(teamId)) {
    return null;
  }

  const catalog = buildTeamCatalog(groups, standingsByGroup);
  const baseTeam = catalog.find((entry) => entry.teamId === teamId);

  if (!baseTeam) {
    return null;
  }

  const teamMatches = getTeamMatches(teamId, matches).sort((left, right) =>
    compareIsoDateAsc(left.kickoffAt, right.kickoffAt)
  );

  return {
    ...baseTeam,
    matches: teamMatches,
    playedMatches: teamMatches.filter(isPlayedMatch),
    upcomingMatches: teamMatches.filter(isUpcomingMatch)
  };
}

