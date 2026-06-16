import type { BracketMatch, BracketRound } from "@/types";
import type { Standing } from "@/types";

// Esta versão usa os dois primeiros de cada grupo e cria pares sequenciais.
// A regra oficial completa da Copa 2026 deve ser refinada posteriormente.

export function getQualifiedTeams(standingsByGroup: Record<string, Standing[]>): string[] {
  return Object.keys(standingsByGroup)
    .sort((left, right) => left.localeCompare(right, "pt-BR"))
    .flatMap((groupId) => standingsByGroup[groupId].slice(0, 2).map((standing) => standing.teamId));
}

export function createBracketMatches(
  teamIds: string[],
  roundId: string
): BracketMatch[] {
  const matches: BracketMatch[] = [];

  for (let index = 0; index < teamIds.length; index += 2) {
    matches.push({
      id: `${roundId}-${index / 2 + 1}`,
      roundId,
      homeTeamId: teamIds[index] ?? null,
      awayTeamId: teamIds[index + 1] ?? null,
      sourceHome: null,
      sourceAway: null,
      matchId: null,
      winnerTeamId: null
    });
  }

  return matches;
}

export function generateBracketFromStandings(
  standingsByGroup: Record<string, Standing[]>
): BracketRound[] {
  const qualifiedTeams = getQualifiedTeams(standingsByGroup);

  return [
    {
      id: "initial-knockout",
      name: "Mata-mata inicial",
      matches: createBracketMatches(qualifiedTeams, "initial-knockout")
    },
    {
      id: "round-of-16",
      name: "Oitavas de final",
      matches: []
    },
    {
      id: "quarter-final",
      name: "Quartas de final",
      matches: []
    },
    {
      id: "semi-final",
      name: "Semifinais",
      matches: []
    },
    {
      id: "final",
      name: "Final",
      matches: []
    }
  ];
}
