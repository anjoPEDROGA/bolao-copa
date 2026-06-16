// Tipos internos: fonte de verdade da aplicação.
// A normalização da API externa deve produzir estes formatos.

export type Group = {
  id: string;
  name: string;
  teamIds: string[];
};

export type Standing = {
  teamId: string;
  groupId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};
