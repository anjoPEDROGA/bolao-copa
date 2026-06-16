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

type ProxyResponse<T> = {
  source?: string;
  data?: T;
  error?: string | null;
};

export type WorldcupProxyResult<T> = {
  source: "proxy" | "empty";
  data: T;
  error?: string | null;
};

async function fetchProxyJson<T>(path: string): Promise<ProxyResponse<T>> {
  const response = await fetch(`/api/worldcup${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Worldcup proxy error: ${response.status}`);
  }

  return (await response.json()) as ProxyResponse<T>;
}

function extractArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    const candidates = [
      value.games,
      value.data,
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

function getArrayFromProxyPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (isRecord(value)) {
    const candidates = [value.matches, value.data, value.games];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return extractArrayPayload(value);
}

function normalizeMatchesPayload(value: unknown): Match[] {
  return getArrayFromProxyPayload(value)
    .map((item) => normalizeWorldcupMatch(item as WorldcupApiMatch))
    .filter((item): item is Match => item !== null);
}

function normalizeGroupsPayload(value: unknown): Group[] {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupGroup(item as WorldcupApiGroup))
    .filter((item): item is Group => item !== null);
}

function normalizeTeamsPayload(value: unknown): Array<{ id: string; name: string }> {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupTeam(item as WorldcupApiTeam))
    .filter((item): item is { id: string; name: string } => item !== null);
}

function normalizeStadiumsPayload(
  value: unknown
): Array<{ id: string; name: string; city?: string; country?: string }> {
  return extractArrayPayload(value)
    .map((item) => normalizeWorldcupStadium(item as WorldcupApiStadium))
    .filter(
      (item): item is { id: string; name: string; city?: string; country?: string } =>
        item !== null
    );
}

export async function fetchWorldcupMatches(): Promise<WorldcupProxyResult<Match[]>> {
  const payload = await fetchProxyJson<unknown>("/games");
  const raw = payload as unknown;
  const rawItems = getArrayFromProxyPayload(raw);
  const data = normalizeMatchesPayload(raw);

  if (rawItems.length > 0 && data.length === 0) {
    console.warn("[worldcup/proxy] matches payload contained items but no match normalized");
  } else if (rawItems.length === 0) {
    console.warn("[worldcup/proxy] matches payload returned no arrays");
  }

  return {
    source: data.length > 0 ? "proxy" : "empty",
    data,
    error: payload.error ?? null
  };
}

export async function fetchWorldcupGroups(): Promise<WorldcupProxyResult<Group[]>> {
  const payload = await fetchProxyJson<unknown>("/groups");
  const data = normalizeGroupsPayload(payload.data ?? payload);
  return {
    source: data.length > 0 ? "proxy" : "empty",
    data,
    error: payload.error ?? null
  };
}

export async function fetchWorldcupTeams(): Promise<
  WorldcupProxyResult<Array<{ id: string; name: string }>>
> {
  const payload = await fetchProxyJson<unknown>("/teams");
  const data = normalizeTeamsPayload(payload.data ?? payload);
  return {
    source: data.length > 0 ? "proxy" : "empty",
    data,
    error: payload.error ?? null
  };
}

export async function fetchWorldcupStadiums(): Promise<
  WorldcupProxyResult<Array<{ id: string; name: string; city?: string; country?: string }>>
> {
  const payload = await fetchProxyJson<unknown>("/stadiums");
  const data = normalizeStadiumsPayload(payload.data ?? payload);
  return {
    source: data.length > 0 ? "proxy" : "empty",
    data,
    error: payload.error ?? null
  };
}
