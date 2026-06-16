import type {
  Group,
  Match,
  MatchesResult,
  WorldcupApiGroup,
  WorldcupApiMatch,
  WorldcupApiStadium,
  WorldcupApiTeam
} from "@/types";
import {
  isRecord,
  isGroupStageMatch,
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

type MatchesProxyResponse = {
  source?: string;
  matches?: unknown;
  data?: unknown;
  games?: unknown;
  total?: number;
  groupTotal?: number;
  knockoutTotal?: number;
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

function pickFirstNonEmptyArray(...values: unknown[]): unknown[] {
  for (const value of values) {
    const candidate = getArrayFromProxyPayload(value);
    if (candidate.length > 0) {
      return candidate;
    }
  }

  return [];
}

function normalizeMatchesPayload(value: unknown): Match[] {
  return pickFirstNonEmptyArray(
    isRecord(value) ? (value as MatchesProxyResponse).matches : null,
    isRecord(value) ? (value as MatchesProxyResponse).data : null,
    isRecord(value) ? (value as MatchesProxyResponse).games : null
  )
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

export async function fetchWorldcupMatches(): Promise<MatchesResult> {
  const payload = await fetchProxyJson<unknown>("/games");
  const raw = payload as unknown;
  const rawItems = isRecord(raw)
    ? pickFirstNonEmptyArray(
        (raw as MatchesProxyResponse).matches,
        (raw as MatchesProxyResponse).data,
        (raw as MatchesProxyResponse).games
      )
    : getArrayFromProxyPayload(raw);
  const matches = normalizeMatchesPayload(raw);
  const totalFromPayload = (payload as MatchesProxyResponse).total;
  const groupTotalFromPayload = (payload as MatchesProxyResponse).groupTotal;
  const knockoutTotalFromPayload = (payload as MatchesProxyResponse).knockoutTotal;
  const total = typeof totalFromPayload === "number" ? totalFromPayload : matches.length;
  const groupTotal =
    typeof groupTotalFromPayload === "number"
      ? groupTotalFromPayload
      : matches.filter((match) => isGroupStageMatch(match)).length;
  const knockoutTotal =
    typeof knockoutTotalFromPayload === "number"
      ? knockoutTotalFromPayload
      : Math.max(0, total - groupTotal);

  if (process.env.NODE_ENV === "development") {
    if (rawItems.length > 0 && matches.length === 0) {
      console.warn("[worldcup/proxy] matches payload contained items but no match normalized");
    } else if (rawItems.length === 0) {
      console.warn("[worldcup/proxy] matches payload returned no arrays");
    }
  }

  if (matches.length === 0) {
    return {
      source: "empty",
      matches: [],
      data: [],
      total: 0,
      groupTotal: 0,
      knockoutTotal: 0,
      error: (payload.error ?? "Invalid or empty matches payload").trim()
    };
  }

  return {
    source: "proxy",
    matches,
    data: matches,
    total,
    groupTotal,
    knockoutTotal,
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
