// Tipos internos: fonte de verdade da aplicação.
// A API externa será normalizada para estes contratos antes de chegar à UI.

export type MatchStatus =
  | "scheduled"
  | "live"
  | "finished"
  | "postponed"
  | "cancelled";

export type TournamentStage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type Score = {
  home: number | null;
  away: number | null;
  homePenalty?: number | null;
  awayPenalty?: number | null;
};

export type Match = {
  id: string;
  groupId?: string | null;
  stage: TournamentStage;
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string;
  kickoffAt: string;
  status: MatchStatus;
  score: Score;
  minute?: number | null;
  lastUpdatedAt?: string | null;
};
