// Tipos brutos da API externa worldcup2026.
// Mantemos o formato flexível para tolerar mudanças no payload remoto.

export type WorldcupApiMatch = Record<string, unknown>;
export type WorldcupApiGroup = Record<string, unknown>;
export type WorldcupApiTeam = Record<string, unknown>;
export type WorldcupApiStadium = Record<string, unknown>;

export type ApiSource = "worldcup" | "fallback" | "empty";

export type MatchesResult = {
  matches: import("./match").Match[];
  source: ApiSource;
};
