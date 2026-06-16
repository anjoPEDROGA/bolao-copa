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
  return Object.entries(teamDictionary)
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
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
