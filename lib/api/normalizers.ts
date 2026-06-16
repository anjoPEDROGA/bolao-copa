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
import { parseWorldcupLocalDateToIso } from "@/lib/datetime";
import { getStadiumTimezone } from "@/lib/translations";

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

export function readBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
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

const validGroupLetters = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]);
const knockoutGroupTokens = new Set([
  "r32",
  "round-of-32",
  "roundof32",
  "32",
  "r16",
  "round-of-16",
  "roundof16",
  "16",
  "qf",
  "quarter",
  "quarter-final",
  "quarterfinal",
  "sf",
  "semi",
  "semi-final",
  "semifinal",
  "3rd",
  "third",
  "third-place",
  "thirdplace",
  "final"
]);

export function isPlaceholderTeamId(teamId: string | null | undefined): boolean {
  if (!teamId) {
    return true;
  }

  const normalized = slugify(teamId);
  return (
    normalized === "0" ||
    normalized === "tbd" ||
    normalized === "unknown" ||
    normalized === "to-be-defined" ||
    normalized === "definir" ||
    normalized === "a-definir"
  );
}

export function isValidWorldcupGroupId(groupId: string | null | undefined): boolean {
  if (!groupId) {
    return false;
  }

  const normalized = slugify(groupId).replace(/^group-/, "");
  return validGroupLetters.has(normalized);
}

export function isGroupStageMatch(match: Match): boolean {
  return match.stage === "group" && isValidWorldcupGroupId(match.groupId);
}

export function normalizeWorldcupGroupId(groupId: string | null | undefined): string | null {
  if (!groupId) {
    return null;
  }

  const normalized = slugify(groupId).replace(/^group-/, "");
  if (validGroupLetters.has(normalized)) {
    return `group-${normalized}`;
  }

  return null;
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

export function normalizeWorldcupStatus(raw: Record<string, unknown>): {
  status: MatchStatus;
  minute: number | null;
} {
  const finished = readBoolean(raw.finished);
  const timeElapsed = readString(raw, ["time_elapsed", "status", "state"]);

  if (finished === true || timeElapsed?.toLowerCase() === "finished") {
    return { status: "finished", minute: extractMatchMinute(raw) };
  }

  if (timeElapsed) {
    const normalized = timeElapsed.trim().toLowerCase();

    if (normalized === "notstarted" || normalized === "not started") {
      return { status: "scheduled", minute: null };
    }

    if (normalized === "postponed") {
      return { status: "postponed", minute: null };
    }

    if (normalized === "cancelled" || normalized === "canceled") {
      return { status: "cancelled", minute: null };
    }

    if (normalized === "live" || normalized === "playing" || normalized === "in_progress") {
      return { status: "live", minute: extractMatchMinute(raw) };
    }

    if (/^\d+$/.test(normalized)) {
      return { status: "live", minute: extractMatchMinute(raw) };
    }
  }

  if (finished === false && timeElapsed === "notstarted") {
    return { status: "scheduled", minute: null };
  }

  return { status: "scheduled", minute: extractMatchMinute(raw) };
}

export function normalizeStage(value: unknown): TournamentStage {
  const normalized =
    typeof value === "string"
      ? slugify(value)
      : typeof value === "number"
        ? String(value)
        : "";

  const stripped = normalized.replace(/^group-/, "");

  if (/^[a-l]$/.test(stripped)) {
    return "group";
  }

  if (stripped === "r32" || stripped === "round-of-32" || stripped === "roundof32" || stripped === "32") {
    return "round-of-32";
  }

  if (stripped === "r16" || stripped === "round-of-16" || stripped === "roundof16" || stripped === "16") {
    return "round-of-16";
  }

  if (stripped === "qf" || stripped === "quarter" || stripped === "quarter-final" || stripped === "quarterfinal") {
    return "quarter-final";
  }

  if (stripped === "sf" || stripped === "semi" || stripped === "semi-final" || stripped === "semifinal") {
    return "semi-final";
  }

  if (stripped === "3rd" || stripped === "third" || stripped === "third-place" || stripped === "thirdplace") {
    return "third-place";
  }

  if (stripped === "final") {
    return "final";
  }

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

function extractMatchMinute(raw: Record<string, unknown>): number | null {
  const minuteValue = readNumber(raw, ["minute", "match_minute", "elapsed"]);
  if (minuteValue !== null) {
    return Math.max(0, Math.floor(minuteValue));
  }

  const timeElapsed = readString(raw, ["time_elapsed"]);
  if (!timeElapsed) {
    return null;
  }

  const normalized = timeElapsed.trim().toLowerCase();
  if (normalized === "finished" || normalized === "notstarted") {
    return null;
  }

  if (/^\d+$/.test(normalized)) {
    return Math.max(0, Number(normalized));
  }

  return null;
}

function normalizeGroupId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = slugify(value).replace(/^group-/, "");
  if (!normalized) {
    return null;
  }

  if (validGroupLetters.has(normalized)) {
    return `group-${normalized}`;
  }

  if (knockoutGroupTokens.has(normalized)) {
    return null;
  }

  return null;
}

function normalizeTeamIdentifier(
  raw: Record<string, unknown>,
  primaryKeys: string[],
  fallbackKeys: string[]
): string | null {
  const primary = readString(raw, primaryKeys);
  if (primary) {
    return slugify(primary);
  }

  const fallback = readString(raw, fallbackKeys);
  if (fallback) {
    return slugify(fallback);
  }

  return null;
}

export function normalizeWorldcupMatch(raw: WorldcupApiMatch): Match | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readString(raw, ["id", "_id"]);
  const homeTeamIdFallback = readString(raw, ["home_team_id", "homeTeamId"]);
  const awayTeamIdFallback = readString(raw, ["away_team_id", "awayTeamId"]);
  const stadiumRaw = readString(raw, ["stadium_id", "stadiumId", "stadium"]);
  const groupValue = readString(raw, ["group"]);
  const typeValue = readString(raw, ["type"]);
  const localDate = readString(raw, ["local_date", "date", "datetime", "kickoff", "kickoff_at", "kickoffAt"]);

  if (!id || !stadiumRaw || !localDate) {
    return null;
  }

  const homeTeamId =
    normalizeTeamIdentifier(
      raw,
      ["home_team_name_en", "home_team", "homeTeam", "home_team_label"],
      ["home_team_id"]
    ) ?? (homeTeamIdFallback ? slugify(homeTeamIdFallback) : null);
  const awayTeamId =
    normalizeTeamIdentifier(
      raw,
      ["away_team_name_en", "away_team", "awayTeam", "away_team_label"],
      ["away_team_id"]
    ) ?? (awayTeamIdFallback ? slugify(awayTeamIdFallback) : null);

  if (!homeTeamId || !awayTeamId) {
    return null;
  }

  const stadiumId = /^\d+$/.test(stadiumRaw) ? `stadium-${stadiumRaw}` : slugify(stadiumRaw);
  const inferredGroupStage = groupValue ? normalizeStage(groupValue) : "group";
  const stageSource =
    inferredGroupStage !== "group" ? groupValue ?? typeValue ?? "group" : typeValue ?? groupValue ?? "group";
  const stage = normalizeStage(stageSource);
  const groupId = stage === "group" ? normalizeGroupId(groupValue) : null;
  const stadiumTimezone = getStadiumTimezone(stadiumId);
  const kickoffAt = parseWorldcupLocalDateToIso(localDate, stadiumTimezone) ?? localDate;
  const { status, minute } = normalizeWorldcupStatus(raw);
  const scoreHomeRaw = readNumber(raw, ["home_score", "homeScore", "score_home"]);
  const scoreAwayRaw = readNumber(raw, ["away_score", "awayScore", "score_away"]);
  const isScoreVisible = status === "live" || status === "finished";

  return {
    id: slugify(id),
    groupId,
    stage,
    homeTeamId,
    awayTeamId,
    stadiumId,
    kickoffAt,
    status,
    score: {
      home: isScoreVisible ? scoreHomeRaw : null,
      away: isScoreVisible ? scoreAwayRaw : null
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
    .filter(
      (item): item is string =>
        typeof item === "string" && item.length > 0 && !isPlaceholderTeamId(item)
    );
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
