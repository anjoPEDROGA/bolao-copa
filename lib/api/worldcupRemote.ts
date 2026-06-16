import type {
  Group,
  Match,
  WorldcupApiGroup,
  WorldcupApiMatch,
  WorldcupApiStadium,
  WorldcupApiTeam
} from "@/types";
import {
  normalizeWorldcupGroup,
  normalizeWorldcupMatch,
  normalizeWorldcupStadium,
  normalizeWorldcupTeam,
  readString,
  slugify
} from "./normalizers";

function getWorldcupApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_WORLDCUP_API_BASE_URL ?? "https://worldcup26.ir").replace(
    /\/+$/,
    ""
  );
}

async function fetchRemoteJson<T>(path: string, cacheMode: RequestCache = "no-store"): Promise<T> {
  const response = await fetch(`${getWorldcupApiBaseUrl()}${path}`, {
    cache: cacheMode
  });

  if (!response.ok) {
    throw new Error(`Worldcup API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

function extractArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [record.games, record.data, record.matches, record.groups, record.teams, record.stadiums];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
}

function deriveGroupsFromGames(games: Match[]): Group[] {
  const groupsById = new Map<string, Group>();

  for (const game of games) {
    if (!game.groupId) {
      continue;
    }

    const existing = groupsById.get(game.groupId);
    const teamIds = new Set(existing?.teamIds ?? []);
    teamIds.add(game.homeTeamId);
    teamIds.add(game.awayTeamId);

    groupsById.set(game.groupId, {
      id: game.groupId,
      name: game.groupId
        .replace(/^group-/, "Grupo ")
        .replace(/\b([a-z])/g, (match) => match.toUpperCase()),
      teamIds: Array.from(teamIds)
    });
  }

  return Array.from(groupsById.values()).sort((left, right) =>
    left.id.localeCompare(right.id, "pt-BR")
  );
}

function formatDerivedGroupName(groupId: string): string {
  const shortId = groupId.replace(/^group-/, "").trim();
  if (!shortId) {
    return "Grupo";
  }

  return `Grupo ${shortId.toUpperCase()}`;
}

function normalizeRemoteGamesPayload(value: unknown): Match[] {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupMatch(item as WorldcupApiMatch))
    .filter((item): item is Match => item !== null);
}

function normalizeRemoteGroupsPayload(value: unknown): Group[] {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupGroup(item as WorldcupApiGroup))
    .filter((item): item is Group => item !== null);
}

function normalizeRemoteTeamsPayload(value: unknown): Array<{ id: string; name: string }> {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupTeam(item as WorldcupApiTeam))
    .filter((item): item is { id: string; name: string } => item !== null);
}

function normalizeRemoteStadiumsPayload(
  value: unknown
): Array<{ id: string; name: string; city?: string; country?: string }> {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupStadium(item as WorldcupApiStadium))
    .filter(
      (item): item is { id: string; name: string; city?: string; country?: string } =>
        item !== null
    );
}

export async function fetchRemoteWorldcupGames(): Promise<Match[]> {
  const payload = await fetchRemoteJson<unknown>("/get/games", "no-store");
  return normalizeRemoteGamesPayload(payload);
}

export async function fetchRemoteWorldcupGroups(): Promise<Group[]> {
  const payload = await fetchRemoteJson<unknown>("/get/groups", "force-cache");
  return normalizeRemoteGroupsPayload(payload);
}

export async function fetchRemoteWorldcupTeams(): Promise<Array<{ id: string; name: string }>> {
  const payload = await fetchRemoteJson<unknown>("/get/teams", "force-cache");
  return normalizeRemoteTeamsPayload(payload);
}

export async function fetchRemoteWorldcupStadiums(): Promise<
  Array<{ id: string; name: string; city?: string; country?: string }>
> {
  const payload = await fetchRemoteJson<unknown>("/get/stadiums", "force-cache");
  return normalizeRemoteStadiumsPayload(payload);
}

export async function fetchRemoteWorldcupGroupsWithFallback(): Promise<Group[]> {
  try {
    const groups = await fetchRemoteWorldcupGroups();
    if (groups.length > 0) {
      return groups;
    }
  } catch {
    // fallback below
  }

  try {
    const games = await fetchRemoteWorldcupGames();
    const groups = deriveGroupsFromGames(games);
    if (groups.length > 0) {
      return groups;
    }
  } catch {
    // static fallback below
  }

  return [];
}

export function deriveGroupsFromWorldcupGames(games: Match[]): Group[] {
  return deriveGroupsFromGames(games).map((group) => ({
    ...group,
    name: formatDerivedGroupName(group.id)
  }));
}

export function sanitizeWorldcupName(name: string): string {
  const slug = slugify(name);
  if (!slug) {
    return name;
  }
  return readString({ name }, ["name"]) ?? name;
}
