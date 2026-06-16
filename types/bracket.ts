// Tipos internos do bracket da competição.
// A camada de dados externa deve ser adaptada antes de expor estes contratos.

export type BracketMatch = {
  id: string;
  roundId: string;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  sourceHome?: string | null;
  sourceAway?: string | null;
  matchId?: string | null;
  winnerTeamId?: string | null;
};

export type BracketRound = {
  id: string;
  name: string;
  matches: BracketMatch[];
};
