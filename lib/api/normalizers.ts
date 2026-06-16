import type {
  Group,
  Match,
  MatchStatus,
  TournamentStage,
  WorldcupApiGroup,
  WorldcupApiMatch,
  WorldcupApiStadium,
  WorldcupApiTeam
} from "@/types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readString(
  record: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      const asString = String(value).trim();
      if (asString) {
        return asString;
      }
    }
  }
  return null;
}

export function readNumber(
  record: Record<string, unknown>,
  keys: string[]
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value.trim());
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeStatus(value: unknown): MatchStatus {
  const normalized =
    typeof value === "string"
      ? slugify(value)
      : typeof value === "number"
        ? String(value)
        : "";

  switch (normalized) {
    case "not-started":
    case "notstarted":
    case "fixture":
    case "pending":
    case "scheduled":
      return "scheduled";
    case "in-progress":
    case "inprogress":
    case "playing":
    case "live":
      return "live";
    case "ended":
    case "full-time":
    case "fulltime":
    case "finished":
      return "finished";
    case "postponed":
      return "postponed";
    case "canceled":
    case "cancelled":
      return "cancelled";
    default:
      return "scheduled";
  }
}

export function normalizeStage(value: unknown): TournamentStage {
  const normalized =
    typeof value === "string"
      ? slugify(value)
      : typeof value === "number"
        ? String(value)
        : "";

  switch (normalized) {
    case "groups":
    case "group-stage":
    case "groupstage":
    case "group":
      return "group";
    case "round-of-32":
    case "round_of_32":
    case "last-32":
    case "last32":
      return "round-of-32";
    case "round-of-16":
    case "round_of_16":
    case "last-16":
    case "last16":
      return "round-of-16";
    case "quarter-final":
    case "quarter_final":
    case "quarterfinal":
      return "quarter-final";
    case "semi-final":
    case "semi_final":
    case "semifinal":
      return "semi-final";
    case "third-place":
    case "third_place":
      return "third-place";
    case "final":
      return "final";
    default:
      return "group";
  }
}

function normalizeTeamId(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? slugify(trimmed) : null;
  }
  if (isRecord(value)) {
    const stringValue = readString(value, ["id", "name", "team", "country"]);
    return stringValue ? slugify(stringValue) : null;
  }
  return null;
}

function normalizeStadiumId(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? slugify(trimmed) : null;
  }
  if (isRecord(value)) {
    const stringValue = readString(value, ["id", "name", "stadium", "venue"]);
    return stringValue ? slugify(stringValue) : null;
  }
  return null;
}

function normalizeIsoString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return null;
}

export function normalizeWorldcupMatch(raw: WorldcupApiMatch): Match | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readString(raw, ["id", "_id", "game_id", "match_id"]);
  const homeTeamRaw =
    raw.home_team ?? raw.homeTeam ?? raw.team_home ?? raw.team1 ?? raw.home;
  const awayTeamRaw =
    raw.away_team ?? raw.awayTeam ?? raw.team_away ?? raw.team2 ?? raw.away;
  const stadiumRaw =
    raw.stadium ?? raw.stadium_id ?? raw.stadiumId ?? raw.venue;
  const dateRaw =
    raw.date ??
    raw.datetime ??
    raw.kickoff ??
    raw.kickoff_at ??
    raw.kickoffAt ??
    raw.start_time;

  const homeTeamId = normalizeTeamId(homeTeamRaw);
  const awayTeamId = normalizeTeamId(awayTeamRaw);
  const stadiumId = normalizeStadiumId(stadiumRaw);
  const kickoffAt = normalizeIsoString(dateRaw);

  if (!id || !homeTeamId || !awayTeamId || !stadiumId || !kickoffAt) {
    return null;
  }

  const groupValue = raw.group ?? raw.group_id ?? raw.groupId;
  const groupId =
    typeof groupValue === "string" && groupValue.trim()
      ? slugify(groupValue)
      : null;

  const stage = groupId ? "group" : normalizeStage(raw.stage ?? raw.phase);

  const scoreHome = readNumber(raw, [
    "home_score",
    "homeScore",
    "score_home",
    "team1_score"
  ]);
  const scoreAway = readNumber(raw, [
    "away_score",
    "awayScore",
    "score_away",
    "team2_score"
  ]);
  const minute = readNumber(raw, ["minute", "match_minute", "elapsed"]);

  return {
    id: slugify(id),
    groupId,
    stage,
    homeTeamId,
    awayTeamId,
    stadiumId,
    kickoffAt,
    status: normalizeStatus(raw.status ?? raw.state),
    score: {
      home: scoreHome,
      away: scoreAway
    },
    minute,
    lastUpdatedAt: new Date().toISOString()
  };
}

function normalizeTeamList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeTeamId(item))
    .filter((item): item is string => typeof item === "string" && item.length > 0);
}

export function normalizeWorldcupGroup(raw: WorldcupApiGroup): Group | null {
  if (!isRecord(raw)) {
    return null;
  }

  const idValue = readString(raw, ["id", "_id", "group_id", "name"]);
  const nameValue = readString(raw, ["name", "group", "title"]);

  if (!idValue || !nameValue) {
    return null;
  }

  return {
    id: slugify(idValue),
    name: nameValue.trim(),
    teamIds: normalizeTeamList(raw.teams ?? raw.teamIds ?? raw.countries)
  };
}

export function normalizeWorldcupTeam(
  raw: WorldcupApiTeam
): { id: string; name: string } | null {
  if (!isRecord(raw)) {
    return null;
  }

  const idValue = readString(raw, ["id", "_id", "team_id", "name", "country"]);
  const nameValue = readString(raw, ["name", "title", "country"]);

  if (!idValue || !nameValue) {
    return null;
  }

  return {
    id: slugify(idValue),
    name: nameValue.trim()
  };
}

export function normalizeWorldcupStadium(
  raw: WorldcupApiStadium
): { id: string; name: string; city?: string; country?: string } | null {
  if (!isRecord(raw)) {
    return null;
  }

  const idValue = readString(raw, ["id", "_id", "stadium_id", "name", "slug"]);
  const nameValue = readString(raw, ["name", "title", "stadium"]);

  if (!idValue || !nameValue) {
    return null;
  }

  const city = readString(raw, ["city", "location_city", "town"]);
  const country = readString(raw, ["country", "nation"]);

  return {
    id: slugify(idValue),
    name: nameValue.trim(),
    ...(city ? { city } : {}),
    ...(country ? { country } : {})
  };
}
