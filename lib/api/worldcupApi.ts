import type {
  Group,
  Match,
  WorldcupApiGroup,
  WorldcupApiMatch,
  WorldcupApiStadium,
  WorldcupApiTeam
} from "@/types";
import {
  isRecord,
  normalizeWorldcupGroup,
  normalizeWorldcupMatch,
  normalizeWorldcupStadium,
  normalizeWorldcupTeam
} from "./normalizers";

export function getWorldcupApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_WORLDCUP_API_BASE_URL ?? "https://worldcup26.ir").replace(
    /\/+$/,
    ""
  );
}

export async function fetchWorldcupJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getWorldcupApiBaseUrl()}${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Worldcup API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function extractArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    const candidates = [
      value.data,
      value.games,
      value.matches,
      value.groups,
      value.teams,
      value.stadiums
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
}

export async function fetchWorldcupMatches(): Promise<Match[]> {
  const payload = await fetchWorldcupJson<unknown>("/get/games");
  return extractArrayPayload(payload)
    .map((item) => normalizeWorldcupMatch(item as WorldcupApiMatch))
    .filter((item): item is Match => item !== null);
}

export async function fetchWorldcupGroups(): Promise<Group[]> {
  const payload = await fetchWorldcupJson<unknown>("/get/groups");
  return extractArrayPayload(payload)
    .map((item) => normalizeWorldcupGroup(item as WorldcupApiGroup))
    .filter((item): item is Group => item !== null);
}

export async function fetchWorldcupTeams(): Promise<Array<{ id: string; name: string }>> {
  const payload = await fetchWorldcupJson<unknown>("/get/teams");
  return extractArrayPayload(payload)
    .map((item) => normalizeWorldcupTeam(item as WorldcupApiTeam))
    .filter((item): item is { id: string; name: string } => item !== null);
}

export async function fetchWorldcupStadiums(): Promise<
  Array<{ id: string; name: string; city?: string; country?: string }>
> {
  const payload = await fetchWorldcupJson<unknown>("/get/stadiums");
  return extractArrayPayload(payload)
    .map((item) => normalizeWorldcupStadium(item as WorldcupApiStadium))
    .filter(
      (item): item is { id: string; name: string; city?: string; country?: string } =>
        item !== null
    );
}
