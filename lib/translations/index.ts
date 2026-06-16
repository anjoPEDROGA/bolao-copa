import type { MatchStatus } from "@/types";
import teams from "./teams.json";
import stadiums from "./stadiums.json";
import timezones from "./timezones.json";

type StadiumInfo = {
  name: string;
  city: string;
  country: string;
};

type TeamDictionary = Record<string, string>;
type StadiumDictionary = Record<string, StadiumInfo>;
type TimezoneDictionary = Record<string, string>;

const teamDictionary = teams as TeamDictionary;
const stadiumDictionary = stadiums as StadiumDictionary;
const timezoneDictionary = timezones as TimezoneDictionary;
const aliasTeamIds = new Set(["usa"]);

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function isPlaceholderTeamId(teamId: string): boolean {
  const normalizedTeamId = normalizeKey(teamId);
  return (
    normalizedTeamId === "0" ||
    normalizedTeamId === "tbd" ||
    normalizedTeamId === "unknown" ||
    normalizedTeamId === "to-be-defined" ||
    normalizedTeamId === "a-definir" ||
    normalizedTeamId === "definir"
  );
}

export function getTeamName(teamId: string): string {
  if (isPlaceholderTeamId(teamId)) {
    return "A definir";
  }

  const normalizedTeamId = normalizeKey(teamId);
  return teamDictionary[normalizedTeamId] ?? teamId;
}

export function getAvailableTeams(): Array<{ id: string; name: string }> {
  const uniqueTeams = new Map<string, { id: string; name: string }>();

  for (const [id, name] of Object.entries(teamDictionary)) {
    const normalizedName = normalizeKey(name);
    const candidate = { id, name };
    const existing = uniqueTeams.get(normalizedName);

    if (!existing) {
      uniqueTeams.set(normalizedName, candidate);
      continue;
    }

    const existingIsAlias = aliasTeamIds.has(existing.id);
    const candidateIsAlias = aliasTeamIds.has(candidate.id);

    if (existingIsAlias && !candidateIsAlias) {
      uniqueTeams.set(normalizedName, candidate);
      continue;
    }

    if (existing.id.length < candidate.id.length && !candidateIsAlias) {
      uniqueTeams.set(normalizedName, candidate);
    }
  }

  return Array.from(uniqueTeams.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "pt-BR")
  );
}

export function getStadiumInfo(stadiumId: string): StadiumInfo | null {
  const normalizedStadiumId = normalizeKey(stadiumId);
  return stadiumDictionary[normalizedStadiumId] ?? null;
}

export function getStadiumTimezone(stadiumId: string): string {
  const normalizedStadiumId = normalizeKey(stadiumId);
  return timezoneDictionary[normalizedStadiumId] ?? "UTC";
}

export function getMatchStatusLabel(status: MatchStatus): string {
  const labels: Record<MatchStatus, string> = {
    scheduled: "Agendado",
    live: "Ao Vivo",
    finished: "Encerrado",
    postponed: "Adiado",
    cancelled: "Cancelado"
  };

  return labels[status];
}
